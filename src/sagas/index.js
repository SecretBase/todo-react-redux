import { take, put, call, fork } from 'redux-saga/effects';
import { takeEvery, takeLatest } from 'redux-saga';
import { eventChannel, END } from 'redux-saga';
import { firebaseDb } from 'src/core/firebase';
import {
	CREATE_TASK_SUCCESS,
	DELETE_TASK_SUCCESS,
	UPDATE_TASK_SUCCESS
} from '../core/tasks/action-types';

import {
	INIT_AUTH,
	SIGN_IN_SUCCESS,
} from '../core/auth/action-types';

function recordFromSnapshot(snapshot) {
	let record = snapshot.val();
	record.key = snapshot.key;
	return record;
}


function tasksFirebase(getState) {

	return eventChannel(listener => {

		const { auth } = getState();
		const ref = firebaseDb.ref(`tasks/${auth.id}`);

		ref.on('child_added', snapshot => listener({
			type: CREATE_TASK_SUCCESS,
			payload: recordFromSnapshot(snapshot)
		}));

		ref.on('child_changed', snapshot => listener({
			type: UPDATE_TASK_SUCCESS,
			payload: recordFromSnapshot(snapshot)
		}));

		ref.on('child_removed', snapshot => listener({
			type: DELETE_TASK_SUCCESS,
			payload: recordFromSnapshot(snapshot)
		}));

		return () => {
			console.log('Turn Off ref listener');
			ref.off();
		}

	});

}

function* watchFirebase(getState) {

	const channel = yield call(tasksFirebase, getState);

	try {
		while(true) {
			let payload = yield take(channel);

			console.log(payload);
			yield put(payload)
		}
	} finally {
		channel.close()
	}

}

function* watcherInitAuth(getState) {
	yield takeLatest(INIT_AUTH, watchFirebase, getState);
}

export default function* mySaga(getState) {
	yield fork(watcherInitAuth, getState);
}
