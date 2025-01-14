import React, { useEffect, useState, useRef } from "react";
import { endOfDay, parseISO, startOfDay } from "date-fns";
import PropTypes from "prop-types";
import DateFnsUtils from "@date-io/date-fns";
import { useFormContext } from "react-hook-form";
import { Select, MenuItem } from "@material-ui/core";
import { DatePicker, DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import { makeStyles } from "@material-ui/core/styles";
import { useLocation } from "react-router-dom";
import qs from "qs";
import isEmpty from "lodash/isEmpty";

import { toServerDateFormat } from "../../../../../libs";
import localize from "../../../../../libs/date-picker-localization";
import { DATE_FORMAT, DATE_TIME_FORMAT } from "../../../../../config";
import { useI18n } from "../../../../i18n";
import Panel from "../../panel";
import styles from "../styles.css";
import { registerInput, handleMoreFiltersChange, resetSecondaryFilter, setMoreFilterOnPrimarySection } from "../utils";

import { NAME } from "./constants";

const Component = ({
  addFilterToList,
  filter,
  filterToList,
  mode,
  moreSectionFilters,
  setMoreSectionFilters,
  reset,
  setReset
}) => {
  const i18n = useI18n();
  const css = makeStyles(styles)();
  const { register, unregister, setValue, getValues } = useFormContext();
  const [inputValue, setInputValue] = useState();
  const valueRef = useRef();
  const { options, field_name: fieldName, dateIncludeTime } = filter;
  const isDateFieldSelectable = Object.keys?.(options)?.length > 0;
  const valueSelectedField = options?.[i18n.locale]?.filter(option =>
    Object.keys(getValues({ nest: true })).includes(option.id)
  )?.[0]?.id;
  const [selectedField, setSelectedField] = useState(valueSelectedField || "");
  const location = useLocation();
  const queryParams = qs.parse(location.search.replace("?", ""));
  const queryParamsKeys = Object.keys(queryParams);

  const handleDatePicker = (field, date) => {
    let formattedDate = date;

    if (date) {
      const dateValue = field === "to" ? endOfDay(date) : startOfDay(date);

      formattedDate = toServerDateFormat(dateIncludeTime ? date : dateValue, {
        includeTime: true,
        normalize: dateIncludeTime === true
      });
    }

    const value = { ...inputValue, [field]: formattedDate };

    setInputValue(value);
    setValue(selectedField, value);

    if (mode?.secondary) {
      setMoreSectionFilters({ ...moreSectionFilters, [selectedField]: value });
    }

    if (addFilterToList) {
      addFilterToList({ [selectedField]: value || undefined });
    }
  };

  const handleSelectedField = event => {
    const { value } = event.target;

    if (selectedField) {
      unregister(selectedField);
    }

    setSelectedField(value);
    setValue(value, undefined);

    if (addFilterToList) {
      addFilterToList({ [value]: undefined });
    }

    if (mode?.secondary) {
      handleMoreFiltersChange(moreSectionFilters, setMoreSectionFilters, value, {});
    }
  };

  const handleReset = () => {
    if (selectedField) {
      setSelectedField("");
      setValue(selectedField, undefined);

      resetSecondaryFilter(
        mode?.secondary,
        selectedField,
        getValues()[fieldName],
        moreSectionFilters,
        setMoreSectionFilters
      );

      if (addFilterToList) {
        addFilterToList({ [fieldName]: undefined });
      }
    }
  };

  const setSecondaryValues = (name, values) => {
    setValue(name, values);
    setInputValue(values);
  };

  const getDateValue = value => {
    if (isEmpty(value)) {
      return value;
    }

    return dateIncludeTime ? parseISO(value) : parseISO(value.slice(0, 10));
  };

  useEffect(() => {
    if (selectedField) {
      registerInput({
        register,
        name: selectedField,
        ref: valueRef,
        setInputValue,
        clearSecondaryInput: () => setSelectedField("")
      });

      if (reset && !mode?.defaultFilter) {
        handleReset();
      }

      setMoreFilterOnPrimarySection(moreSectionFilters, selectedField, setSecondaryValues);
    } else if (queryParamsKeys.length && !Object.keys(moreSectionFilters).length) {
      const data = filter?.options?.[i18n.locale].find(option => queryParamsKeys.includes(option.id));
      const selectValue = data?.id;
      const datesValue = queryParams?.[selectValue];

      setSelectedField(selectValue);
      setInputValue(datesValue);
    } else if (filterToList && !isEmpty(Object.keys(filterToList))) {
      const data = filter?.options?.[i18n.locale].find(option => Object.keys(filterToList).includes(option.id));
      const selectValue = data?.id;
      const datesValue = filterToList?.[selectValue];

      setSelectedField(selectValue);
      setInputValue(datesValue);
    }

    return () => {
      if (selectedField) {
        unregister(selectedField);
        if (setReset) {
          setReset(false);
        }
      }
    };
  }, [register, unregister, selectedField, valueRef]);

  const renderSelectOptions = () =>
    options?.[i18n.locale]?.map(option => (
      <MenuItem value={option.id} key={option.id}>
        {option.display_name}
      </MenuItem>
    ));

  const pickerFormat = dateIncludeTime ? DATE_TIME_FORMAT : DATE_FORMAT;

  const renderPickers = ["from", "to"].map(picker => {
    const props = {
      fullWidth: true,
      margin: "normal",
      format: pickerFormat,
      label: i18n.t(`fields.date_range.${picker}`),
      value: getDateValue(inputValue?.[picker]),
      onChange: date => handleDatePicker(picker, date),
      disabled: !selectedField
    };

    return (
      <div key={picker} className={css.dateInput}>
        <MuiPickersUtilsProvider utils={DateFnsUtils} locale={localize(i18n)}>
          {dateIncludeTime ? <DateTimePicker {...props} /> : <DatePicker {...props} />}
        </MuiPickersUtilsProvider>
      </div>
    );
  });

  return (
    <Panel
      filter={filter}
      getValues={getValues}
      selectedDefaultValueField={selectedField}
      handleReset={handleReset}
      moreSectionFilters={moreSectionFilters}
    >
      <div className={css.dateContainer}>
        {" "}
        {isDateFieldSelectable && (
          <div className={css.dateInput}>
            <Select fullWidth value={selectedField} onChange={handleSelectedField} variant="outlined">
              {renderSelectOptions()}
            </Select>
          </div>
        )}
        {renderPickers}
      </div>
    </Panel>
  );
};

Component.defaultProps = {
  moreSectionFilters: {}
};

Component.propTypes = {
  addFilterToList: PropTypes.func,
  filter: PropTypes.object.isRequired,
  filterToList: PropTypes.object.isRequired,
  mode: PropTypes.shape({
    defaultFilter: PropTypes.bool,
    secondary: PropTypes.bool
  }),
  moreSectionFilters: PropTypes.object,
  reset: PropTypes.bool,
  setMoreSectionFilters: PropTypes.func,
  setReset: PropTypes.func
};

Component.displayName = NAME;

export default Component;
