import { createReducer } from 'redux-act';
import { combineReducers } from 'redux';
import { assoc, contains, unless, where, evolve, append, has, pipe, unapply,
  prop, map, cond, pluck, converge, zip, lensPath, pathEq, assocPath, over, reduce, subtract, sort } from 'ramda';
import { IStoreList, whenNot, whenNotC, getListOf, appendNew } from 'helpers/state';
import { TById, IMtpMessage } from '../mtproto';
import { CHATS } from 'actions';

import { IMtpGetDialogs } from 'redux/mtproto';

const { LOAD_SLICE, GET_DIALOGS } = CHATS;

export type IStoreHistory = IStoreList<IMtpMessage>;

export type IStoreHistories = IStoreList<IStoreHistory>;
const ids = createReducer({
  [LOAD_SLICE.INIT]: appendNew,
}, []);

const newSlice = () => {
  const res: any = {
    ids: [],
    byId: {},
  };
  return res;
};

const newSliceField = field => assoc(field, newSlice());

const onSliceInit = (state: TById<IStoreHistory>, id: number) => whenNot(has, newSliceField)(state, id);

const appendSorted = id => pipe( append(id), sort(subtract) );

const addMessage = (state: IStoreHistory, message: IMtpMessage) =>
  unless(
    where({ ids: contains(message.id) }),
    evolve({
      ids: appendSorted(message.id),
      byId: assoc(message.id, message),
    }),
  )(state);
const addMessages = (state: IStoreHistory, messages: IMtpMessage[]) =>
  messages.reduceRight(addMessage, state);
// NOTE reduceRight is used because of reversed new-to-old order in message window
// And best place to reverse order is here

type TMessageRecord = {
  id: number;
  messages: IMtpMessage[]
};

const onSliceDone = (state: TById<IStoreHistory>, { id, messages }: TMessageRecord) =>
  assoc(id, addMessages(state[id], messages), state);

const chooseField = unapply(pipe( map( e => [ has(e), prop(e) ] ), cond ));

const getAnyId = chooseField('user_id', 'chat_id', 'channel_id');

const dialogsIds = pipe( getListOf('dialogs'), pluck('peer'), map(getAnyId) );

const dialogsReducer = (state: TById<IStoreHistory>, [ id, message ]: [number, IMtpMessage]) => {
  const msgId = message.id;

  const messagePath = [id, 'byId', msgId];
  const idsLens = lensPath([id, 'ids']);
  const isStoredEquals = pathEq( messagePath, message );

  const idsAddNew = whenNotC(contains, append, msgId);
  const updateMessage = pipe(
    assocPath(messagePath, message),
    over(idsLens, idsAddNew) );

  const onNotExists = whenNotC(has, newSliceField, id);
  const updateChanged = unless(isStoredEquals, updateMessage);
  return pipe( onNotExists, updateChanged )(state);
};

const linkDialogsMsg = converge(zip, [dialogsIds, getListOf('messages')]);

const onGetDialog = (state: TById<IStoreHistory>, payload: IMtpGetDialogs) => pipe(
  linkDialogsMsg,
  reduce(dialogsReducer, state),
)(payload);

const byId = createReducer({
  [LOAD_SLICE.INIT]: onSliceInit,
  [LOAD_SLICE.DONE]: onSliceDone,
  [GET_DIALOGS.DONE]: onGetDialog,
}, {});

const reducer = combineReducers({
  ids,
  byId,
});

export default reducer;