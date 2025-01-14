import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { PageHeading } from "../../../page";
import { useI18n } from "../../../i18n";

import { attemptLogin } from "./action-creators";
import { getIdentityProviders } from "./selectors";
import { signIn } from "./auth-provider";
import { NAME } from "./config";
import styles from "./styles.css";
import { PRIMERO_IDP } from "./constants";
import PrimeroIdpLink from "./components/primero-idp-link";

const showIdps = (identityProviders, dispatch) => {
  const tokenCallback = accessToken => {
    dispatch(attemptLogin(accessToken));
  };

  return identityProviders.map(idp => {
    if (idp.get("unique_id") === PRIMERO_IDP && identityProviders.size > 1) {
      return null;
    }

    return (
      <Button
        color="primary"
        type="submit"
        size="large"
        fullWidth
        key={idp.get("name")}
        onClick={() => signIn(idp, tokenCallback)}
      >
        {idp.get("name")}
      </Button>
    );
  });
};

const Container = () => {
  const identityProviders = useSelector(state => getIdentityProviders(state));
  const i18n = useI18n();
  const css = makeStyles(styles)();
  const dispatch = useDispatch();

  return (
    <>
      <PageHeading title={i18n.t("login.title")} whiteHeading />
      <p className={css.selectProvider}>{i18n.t("select_provider")}</p>
      <div className={`${css.loginSelection} loginSelection`}>{showIdps(identityProviders, dispatch)}</div>
      <PrimeroIdpLink identityProviders={identityProviders} i18n={i18n} dispatch={dispatch} css={css} />
    </>
  );
};

Container.displayName = NAME;

export default Container;
