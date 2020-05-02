import { call, put, takeEvery, delay } from "redux-saga/effects";
import { transferAccountRequest, getAccountsRequest, replenishAccountRequest, getHistoryRequest, setHistoryRequest } from "./apiRequests";
import { TRANSFER_ACCOUNT_LOADER,
  transferAccountSuccess,
  transferAccountError,
  historyObject,
  accountHistoryLoader
} from "../actions";
import {message} from 'antd';

function* transferAccountFlow(action) {
  try {
    const { payload: { value, accountNumber, currentAccount, currentAccountValue} } = action;
    const response = yield call(getAccountsRequest);
    const value2 = response.data.find(element => element.account_number === parseInt(accountNumber)).account_balance + parseFloat(value);
    yield call(transferAccountRequest, accountNumber, value2);
    yield call(replenishAccountRequest, currentAccount, parseFloat(currentAccountValue)-parseFloat(value))
    yield delay(500);
    yield put(transferAccountSuccess());
    const history = yield call(getHistoryRequest, currentAccount);
    yield call(setHistoryRequest, currentAccount, historyObject(history.data.data, `Перевод на счет ${accountNumber}`, parseFloat(value)));
    const history2 = yield call(getHistoryRequest, accountNumber);
    yield call(setHistoryRequest, accountNumber, historyObject(history2.data.data, `Зачисление со счета ${currentAccount}`, parseFloat(value)));
    yield put(accountHistoryLoader(currentAccount))
    message.success('Перевод прошел успешно', 1.5)
    // window.location.reload();
  } catch (error) {
    yield put(transferAccountError(error));
    message.error('Ошибка!', 2.5)
  }
}

function* transferAccountSagas() {
  yield takeEvery(
    [TRANSFER_ACCOUNT_LOADER],
    transferAccountFlow
  );
}

export default transferAccountSagas;
