import configureStore from "redux-mock-store";

import { expect, spy, stub } from "../../test";
import * as idpSelection from "../pages/login/idp-selection";

import { Actions } from "./actions";
import * as actionCreators from "./action-creators";

describe("User - Action Creators", () => {

  it("should have known action creators", () => {
    const creators = { ...actionCreators };

    [
      "setUser",
      "fetchAuthenticatedUserData",
      "setAuthenticatedUser",
      "attemptSignout",
      "checkUserAuthentication",
      "refreshToken"
    ].forEach(method => {
      expect(creators).to.have.property(method);
      expect(creators[method]).to.be.a("function");
      delete creators[method];
    });

    expect(creators).to.be.empty;
  });

  it("should check the 'setAuthenticatedUser' action creator to return the correct object", () => {
    const store = configureStore()({});
    const dispatch = spy(store, "dispatch");
    const user = {
      id: 1,
      username: "primero"
    };

    actionCreators.setAuthenticatedUser(user)(dispatch);
    const firstCallReturnValue = dispatch.getCall(0).returnValue;

    expect(firstCallReturnValue.type).to.deep.equal(
      Actions.SET_AUTHENTICATED_USER
    );
    expect(firstCallReturnValue.payload).to.deep.equal(user);
  });

  it("should check the 'setUser' action creator to return the correct object", () => {
    const dispatch = spy(actionCreators, "setUser");
    const expected = {
      type: Actions.SET_AUTHENTICATED_USER,
      payload: true
    };

    actionCreators.setUser(true);

    expect(dispatch.getCall(0).returnValue).to.deep.equal(expected);
  });

  it("should check the 'fetchAuthenticatedUserData' action creator to return the correct object", () => {
    const store = configureStore()({});
    const dispatch = spy(store, "dispatch");
    const expected = {
      path: "users/1",
      params: { extended: true },
      db: { collection: "user" }
    };

    actionCreators.fetchAuthenticatedUserData(1)(dispatch);
    const firstCallReturnValue = dispatch.getCall(0).returnValue;

    expect(firstCallReturnValue.type).to.deep.equal(Actions.FETCH_USER_DATA);
    expect(firstCallReturnValue.api).to.deep.equal(expected);
  });

  it("should check the 'attemptSignout' action creator", () => {
    const store = configureStore()({});
    const dispatch = spy(store, "dispatch");
    let signOut = stub(idpSelection, "signOut");
    const expected = {
      path: "tokens",
      method: "DELETE",
      successCallback: Actions.LOGOUT_SUCCESS_CALLBACK
    };

    beforeEach(() => {
      signOut = stub(idpSelection, "signOut");
    });

    afterEach(() => {
      signOut.restore();
    });

    it("should return the correct object", () => {
      const usingIdp = true;

      actionCreators.attemptSignout(usingIdp, signOut)(dispatch);
      const firstCallReturnValue = dispatch.getCall(0).returnValue;

      expect(firstCallReturnValue.type).to.deep.equal(Actions.LOGOUT);
      expect(firstCallReturnValue.api).to.deep.equal(expected);

    });

    it("should call msal signOut if using IDP", () => {
      const usingIdp = true;
      actionCreators.attemptSignout(usingIdp, signOut)(dispatch);
      expect(signOut).to.have.been.called;
    });

    it("should not call msal signOut if not using IDP", () => {
      const usingIdp = false;
      actionCreators.attemptSignout(usingIdp, signOut)(dispatch);
      expect(signOut).not.to.have.been.called;
    });
  });

  it("should check the 'checkUserAuthentication' action creator to return the correct object", () => {
    const store = configureStore()({});
    const dispatch = spy(store, "dispatch");

    global.localStorage.setItem("user", '{"id": "1", "username": "primero"}');
    actionCreators.checkUserAuthentication()(dispatch);
    const firstCall = dispatch.getCall(0);

    expect(dispatch).to.have.been.called;
    expect(firstCall.args[0]).to.be.a("function");
  });

  it("should check the 'refreshToken' action creator to return the correct object", () => {
    const store = configureStore()({});
    const dispatch = spy(store, "dispatch");
    const expected = {
      path: "tokens",
      method: "POST"
    };

    actionCreators.refreshToken()(dispatch);
    const firstCallReturnValue = dispatch.getCall(0).returnValue;

    expect(firstCallReturnValue.type).to.deep.equal(Actions.REFRESH_USER_TOKEN);
    expect(firstCallReturnValue.api).to.deep.equal(expected);
  });
});