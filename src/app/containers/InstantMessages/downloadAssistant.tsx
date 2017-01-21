import * as React from 'react';
import { connect } from 'react-redux';
import { isEmpty, unless, any } from 'ramda';

import { IStorePhotoCache } from 'redux/modules/photoCache';
import { IStore, IDispatch } from 'redux/IStore';
// import { Queued } from 'helpers/Telegram/Files/queue'
import { CACHE } from 'redux/actions';
import { IMtpFileLocation } from 'redux/mtproto';
import { client, invoke } from 'helpers/Telegram';
import picStore from 'helpers/FileManager/picStore'

import * as Knack from 'knack'
const knack = Knack({ concurrency: 5, interval: 100 })
const kInvoke = knack(invoke, { onTimeout: Knack.timeouts.reject })

const { LOAD, DONE } = CACHE



interface IPropsStore {
  photoCache: IStorePhotoCache
}

interface IPropsDispatch {
  load: (list: string[]) => any,
  done: (id: string) => any,
}

const beginLoad = (id: string, loc: IMtpFileLocation) => {
  const { dc_id, volume_id, secret, local_id } = loc;
  const inputLocation = Object.assign(
    new client.schema.type.InputFileLocation(),
    { dc_id, volume_id, secret, local_id },
  )
  console.warn(`idle`, loc)
  const loader = kInvoke('upload.getFile', {
    location: inputLocation,
    offset: 0,
    limit: 1024 * 1024,
  }, {
    dcID: loc.dc_id,
    fileDownload: true,
    createNetworker: true,
    noErrorBox: true,
  })
  loader.then((data: any) => picStore.addPic(id, data.bytes))
  loader.then(console.warn, console.warn)
  return loader
}
// tslint:disable:no-debugger
const DownloadAssistant = ({ photoCache, load, done }: IPropsStore & IPropsDispatch) => {
  const { idle, downloaded } = photoCache.cache
  console.count('DownloadAssistant')
  console.log(idle.length)
  if (any(e => !picStore.has(e), downloaded)) {
    console.warn('no in picStore!')
  }
  const mapLoad = (id: string) => {
    let ab = 0
    ab++
    const photo = photoCache.photos.byId[id]
    if (!photo) {
      return
    }
    return beginLoad(id, photo.photo_small)
    .then(() => done(id))
  }
  idle.map(mapLoad)
  unless(isEmpty, load)(idle)

  return isEmpty(downloaded)
    ? <span />
    : <img src={picStore.get(downloaded[0])} />
}

const stateProps = ({ photoCache }: IStore) => ({ photoCache })
const dispatchProps = (dispatch: IDispatch) => ({
  load: (list: string[]) => dispatch(LOAD(list)),
  done: (id: string) => dispatch(DONE(id)),
})

const connected = connect(stateProps, dispatchProps)(DownloadAssistant)

export default connected