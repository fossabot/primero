import React from "react";
import PropTypes from "prop-types";
import { useFormContext } from "react-hook-form";
import { useSelector } from "react-redux";
import get from "lodash/get";

import { ConditionalWrapper } from "../../../libs";
import { notVisible } from "../utils";
import { useI18n } from "../../i18n";
import TextInput from "../fields/text-input";
import SwitchInput from "../fields/switch-input";
import SelectInput from "../fields/select-input";
import ErrorField from "../fields/error-field";
import RadioField from "../fields/radio-input";
import ToggleField from "../fields/toggle-input";
import DateField from "../fields/date-input";
import Seperator from "../fields/seperator";
import OrderableOptionsField from "../fields/orderable-options-field";
import DialogTrigger from "../fields/dialog-trigger";
import HiddenInput from "../fields/hidden-input";
import { DATE_FORMAT, DATE_TIME_FORMAT } from "../../../config";
import {
  CHECK_BOX_FIELD,
  ERROR_FIELD,
  LABEL_FIELD,
  ORDERABLE_OPTIONS_FIELD,
  PHOTO_FIELD,
  SELECT_FIELD,
  TICK_FIELD,
  RADIO_FIELD,
  TOGGLE_FIELD,
  DATE_FIELD,
  SEPARATOR,
  DIALOG_TRIGGER,
  HIDDEN_FIELD,
  DOCUMENT_FIELD
} from "../constants";
import CheckboxInput from "../fields/checkbox-input";
import AttachmentInput from "../fields/attachment-input";
import Label from "../fields/label";
import { getOptions } from "../selectors";

const FormSectionField = ({ checkErrors, field }) => {
  const {
    type,
    hideOnShow,
    required,
    name,
    display_name: displayName,
    help_text: helpText,
    autoFocus,
    option_strings_source: optionStringsSource,
    option_strings_text: optionsStringsText,
    options,
    password,
    multi_select: multiSelect,
    editable,
    watchedInputs,
    handleWatchedInputs,
    showIf,
    inlineCheckboxes,
    freeSolo,
    check_errors: fieldCheckErrors,
    hint,
    disabled,
    inputClassname,
    date_include_time: dateIncludeTime,
    selected_value: selectedValue,
    visible,
    groupBy,
    tooltip,
    numeric,
    onChange,
    disableClearable,
    onBlur,
    asyncOptions,
    asyncAction,
    asyncParams,
    asyncParamsFromWatched,
    asyncOptionsLoadingPath,
    clearDependentValues,
    option_strings_source_id_key: optionStringsSourceIdKey,
    setOtherFieldValues,
    wrapWithComponent: WrapWithComponent,
    onClick,
    placeholder,
    maxSelectedOptions,
    onKeyPress,
    currRecord
  } = field;
  const i18n = useI18n();
  const methods = useFormContext();
  const { formMode, errors, watch } = methods;
  const error = errors ? get(errors, name) : undefined;
  const errorsToCheck = checkErrors ? checkErrors.concat(fieldCheckErrors) : fieldCheckErrors;

  const optionSource = useSelector(
    state =>
      getOptions(state, optionStringsSource, i18n, options || optionsStringsText, false, {
        optionStringsSourceIdKey,
        currRecord
      }),
    (prev, next) => prev.equals(next)
  );

  const watchedInputsValues = watchedInputs ? watch(watchedInputs) : null;
  const watchedInputProps = handleWatchedInputs
    ? handleWatchedInputs(watchedInputsValues, name, { error, methods })
    : {};

  const renderError = () =>
    checkErrors?.size && errors
      ? Object.keys(errors).some(errorKey => checkErrors.includes(errorKey) && name.includes(errorKey))
      : false;

  const format = dateIncludeTime ? DATE_TIME_FORMAT : DATE_FORMAT;

  const handleVisibility = () => {
    if (showIf && !formMode.get("isShow")) {
      return !showIf(watchedInputsValues);
    }

    return hideOnShow && formMode.get("isShow");
  };

  const commonInputProps = {
    name,
    disabled:
      typeof disabled === "boolean" ? disabled : formMode.get("isShow") || (formMode.get("isEdit") && !editable),
    required,
    autoFocus,
    error: typeof error !== "undefined" || renderError(),
    label: i18n.getI18nStringFromObject(displayName),
    helperText: error?.message || i18n.getI18nStringFromObject(helpText),
    fullWidth: true,
    autoComplete: "off",
    InputLabelProps: {
      shrink: true
    },
    className: inputClassname,
    format,
    placeholder,
    ...watchedInputProps
  };

  const metaInputProps = {
    type,
    password,
    multiSelect,
    inlineCheckboxes,
    freeSolo,
    hint,
    groupBy: watchedInputProps?.groupBy || groupBy,
    selectedValue,
    tooltip,
    numeric,
    onChange,
    disableClearable,
    onBlur,
    asyncOptions,
    asyncAction,
    asyncParams,
    asyncParamsFromWatched,
    asyncOptionsLoadingPath,
    watchedInputsValues,
    clearDependentValues,
    setOtherFieldValues,
    onClick,
    onKeyPress,
    maxSelectedOptions
  };

  const Field = (fieldType => {
    switch (fieldType) {
      case TICK_FIELD:
        return SwitchInput;
      case CHECK_BOX_FIELD:
        return CheckboxInput;
      case SELECT_FIELD:
        return SelectInput;
      case PHOTO_FIELD:
      case DOCUMENT_FIELD:
        return AttachmentInput;
      case LABEL_FIELD:
        return Label;
      case ERROR_FIELD:
        return ErrorField;
      case RADIO_FIELD:
        return RadioField;
      case TOGGLE_FIELD:
        return ToggleField;
      case DATE_FIELD:
        return DateField;
      case ORDERABLE_OPTIONS_FIELD:
        return OrderableOptionsField;
      case SEPARATOR:
        return Seperator;
      case DIALOG_TRIGGER:
        return DialogTrigger;
      case HIDDEN_FIELD:
        return HiddenInput;
      default:
        return TextInput;
    }
  })(type);

  if (notVisible(visible) || notVisible(watchedInputProps?.visible)) {
    return null;
  }

  return (
    <div>
      {handleVisibility() || (
        <ConditionalWrapper condition={Boolean(WrapWithComponent)} wrapper={WrapWithComponent}>
          <Field
            field={field}
            commonInputProps={commonInputProps}
            metaInputProps={metaInputProps}
            options={watchedInputProps?.options || optionSource?.toJS()}
            errorsToCheck={errorsToCheck}
          />
        </ConditionalWrapper>
      )}
    </div>
  );
};

FormSectionField.displayName = "FormSectionField";

FormSectionField.propTypes = {
  checkErrors: PropTypes.object,
  field: PropTypes.object.isRequired
};

export default FormSectionField;
