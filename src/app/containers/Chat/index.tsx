import * as React from 'react';
import { connect } from 'react-redux';

import { Chat, DefaultScreen } from 'components/Chat';
import { IStore } from 'redux/IStore';
import { IStoreHistory } from 'redux/modules/histories';
import { getPeerData } from 'helpers/Telegram/Peers';
import { IMtpUser, IMtpChat } from 'redux/mtproto';
import { Message } from 'components/Message';
import { selectChat } from 'redux/api/chatList';
import { getPeerName } from 'helpers/Telegram/Peers';
import { TPeersType } from 'redux/modules/peers';

// tslint:disable:jsx-wrap-multiline
// tslint:disable:curly

const onChatSelect = async (currentId: number, nextId: number) => {
  if (nextId && nextId !== currentId) {
    await selectChat(nextId);
  }
};

class ChatContainer extends React.Component<IConnectedState, any> {
  public componentWillReceiveProps(nextProps: IConnectedState) {
    const { selected } = this.props;
    onChatSelect(selected, nextProps.selected);
  }
  public renderMessage = (id: number) => {
    const { from_id, date, message } = this.props.history.byId[id];
    return <Message key={id} id={id} date={date} user={from_id} text={message} />;
  }
  public render() {
    if (!this.props.selected) return <DefaultScreen />;
    const { history, peerName } = this.props;
    return (
      <Chat name={peerName} userCount={0}>
        {history.ids.map(this.renderMessage)}
      </Chat>
    );
  }
}

interface IConnectedState {
  selected: number;
  history?: IStoreHistory;
  peer?: TPeersType;
  peerData?: IMtpUser | IMtpChat;
  peerName?: string;
}

const defaultDialog: IStoreHistory = {
  ids: [],
  byId: {},
};

const stateMap = (state: IStore) => {
  const selected = state.selected.dialog;
  if (!selected) return {
    selected,
    history: defaultDialog,
  };

  const history = state.histories.byId[selected] || defaultDialog;
  const peer = state.peers.byId[selected];
  const peerData = getPeerData(selected, peer, state);
  const peerName = getPeerName(peer, peerData);
  return {
    selected,
    history,
    peer,
    peerData,
    peerName,
  };
};

const connected = connect<IConnectedState, {}, {}>(stateMap, null)(ChatContainer);

export { connected as Chat };