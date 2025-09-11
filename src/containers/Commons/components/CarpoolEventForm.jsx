import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import TextField, { FieldLabel } from "atomicComponents/TextField";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button, Row, Collapse } from "reactstrap";
import Toast from "shared/components/Toast";
import styled from "styled-components";
import { SearchBox } from "@mapbox/search-js-react";
import { firebaseInstance } from "containers/firebase";

const Form = styled.form``;
const ErrorSpan = styled.span`
  color: red;
`;
const FieldWrapper = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 225px;
`;

const ButtonWrapper = styled(Row)`
  display: flex;
  align-items: center;
  .CSVImporter_Importer {
    margin: 10px;
    max-width: 100%;
  }
`;

const FileInfo = styled.p`
  margin: 0;
`;

const FORM_ID = "carpool-event-form";

const defaultValue = {
  title: "",
  eventUrl: "",
  startTime: "15:00",
  endTime: "17:00",
  dailyStartTimes: {
    day1: "15:00",
    day2: "15:00",
  },
  destination: {
    name: "",
    location: null,
  },
  destinationDetails: "",
  closingDate: "",
  lastReminderDate: "",
  maxMatchPerUser: 3,
  maxMinutesDetourDriver: 30,
  maxMinutesDetourRider: 30,
};

const HiddenInput = styled.input`
  display: none;
`;

const CarpoolEventForm = ({ errors, onSubmit, handleAddCsv, initialValues = defaultValue, isLoading }) => {
  const { t, i18n } = useTranslation("common");

  const { control, handleSubmit, reset, getValues } = useForm({
    defaultValues: initialValues,
  });

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  // Initial state for isOpen based on initialValues.title
  const [isOpen, setIsOpen] = useState(initialValues.title === "" ? true : false);
  useEffect(() => {
    setIsOpen(initialValues.title === "" ? true : false);
  }, [initialValues.title]); // Re-run when title changes

  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState(null);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const submitDisabled = useMemo(() => isLoading, [isLoading]);

  // Toggle collapse state
  const toggleCollapse = () => setIsOpen(!isOpen);

  return (
    <div>
      <Button
        color="primary"
        type="button"
        onClick={toggleCollapse}
        style={{ margin: "10px" }}
        outline
      >
        {isOpen ? t("dashboard_commerce.collapse") : t("dashboard_commerce.expand")}
      </Button>

      <Collapse isOpen={isOpen}>
        <Form onSubmit={handleSubmit((data) => onSubmit({ ...data }))} id={FORM_ID}>
          <Toast />
          <ButtonWrapper style={{ margin: 0 }}>
            <Button
              color="primary"
              type="button" // Use "button" to avoid accidental form submissions
              style={{ margin: "10px" }}
              disabled={submitDisabled}
              onClick={handleButtonClick}
            >
              {t("challenge.csv_file_name")}
            </Button>
            <HiddenInput
              ref={fileInputRef}
              type="file"
              name="carpoolersFile"
              onChange={(event) => {
                const file = event.target.files[0];
                console.log(event.target.files[0]);
                setFileName(file.name);
                handleAddCsv(file);
              }}
            />
            {fileName && <FileInfo>{fileName}</FileInfo>}
            {errors && errors.carpoolersFile && <ErrorSpan>{errors.carpoolersFile[i18n.language]}</ErrorSpan>}{" "}
          </ButtonWrapper>
          <Row style={{ margin: 0 }}>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <FieldWrapper>
                  <TextField
                    label={t("dashboard_commerce.title")}
                    value={field.value}
                    onChange={field.onChange}
                    style={{ width: "auto" }}
                  />
                  {errors && errors.title && <ErrorSpan style={{ marginLeft: "8px" }}>{errors.title[i18n.language]}</ErrorSpan>}
                </FieldWrapper>
              )}
            />
            <Controller
              name="eventUrl"
              control={control}
              render={({ field }) => (
                <FieldWrapper>
                  <TextField
                    label={t("dashboard_commerce.event_url")}
                    value={field.value}
                    onChange={field.onChange}
                    style={{ width: "auto" }}
                  />
                  {errors && errors.eventUrl && <ErrorSpan style={{ marginLeft: "8px" }}>{errors.eventUrl[i18n.language]}</ErrorSpan>}
                </FieldWrapper>
              )}
            />
          </Row>
          <Row style={{ margin: 0 }}>
            <Controller
              name="eventDate"
              control={control}
              render={({ field }) => (
                <FieldWrapper
                  className="carpool-event-form"
                  style={{
                    margin: "8px",
                  }}
                >
                  <FieldLabel label={t("dashboard_commerce.event_date")} />
                  <DatePicker
                    label="eventDate"
                    className="input"
                    selected={field?.value}
                    onChange={(date) => {
                      date.setHours(12);
                      field.onChange(date);
                    }}
                    minDate={new Date()}
                    dateFormat="yyyy/MM/dd"
                    showIcon
                  />
                  {errors && errors.eventDate && <ErrorSpan>{errors.eventDate[i18n.language]}</ErrorSpan>}
                </FieldWrapper>
              )}
            />
          </Row>
          <Row style={{ margin: 0 }}>
            <Controller
              name="startTime"
              control={control}
              render={({ field }) => (
                <FieldWrapper
                  className="carpool-event-form"
                  style={{
                    margin: "8px",
                  }}
                >
                  <FieldLabel label={t("dashboard_commerce.start_time")} />
                  <DatePicker
                    label="startTime"
                    className="input"
                    selected={new Date().setHours(...field?.value?.split(":"))}
                    onChange={(date) => {
                      const hours = date.getHours();
                      const minutes = date.getMinutes();
                      const time = `${hours}:${minutes < 10 ? `0${minutes}` : minutes}`;
                      field.onChange(time);
                    }}
                    showTimeSelect
                    showTimeSelectOnly
                    timeFormat="HH:mm"
                    timeIntervals={10}
                    timeCaption="time"
                    dateFormat="HH:mm"
                    showIcon
                  />
                  {errors && errors.startTime && <ErrorSpan>{errors.startTime[i18n.language]}</ErrorSpan>}
                </FieldWrapper>
              )}
            />
            <Controller
              name="endTime"
              control={control}
              render={({ field }) => (
                <FieldWrapper
                  className="carpool-event-form"
                  style={{
                    margin: "8px",
                  }}
                >
                  <FieldLabel label={t("dashboard_commerce.end_time")} />
                  <DatePicker
                    label="endTime"
                    className="input"
                    selected={new Date().setHours(...field?.value?.split(":"))}
                    onChange={(date) => {
                      const hours = date.getHours();
                      const minutes = date.getMinutes();
                      const time = `${hours}:${minutes < 10 ? `0${minutes}` : minutes}`;
                      field.onChange(time);
                    }}
                    showTimeSelect
                    showTimeSelectOnly
                    timeFormat="HH:mm"
                    timeIntervals={10}
                    timeCaption="time"
                    dateFormat="HH:mm"
                    showIcon
                  />
                  {errors && errors.endTime && <ErrorSpan>{errors.endTime[i18n.language]}</ErrorSpan>}
                </FieldWrapper>
              )}
            />
          </Row>

          <Row style={{ margin: 0 }}>
            <Controller
              name="dailyStartTimes.day1"
              control={control}
              render={({ field }) => (
                <FieldWrapper
                  className="carpool-event-form"
                  style={{
                    margin: "8px",
                  }}
                >
                  <FieldLabel label={t("dashboard_commerce.day_1_start_time")} />
                  <DatePicker
                    label="dailyStartTimes.day1"
                    className="input"
                    selected={new Date().setHours(...field?.value?.split(":"))}
                    onChange={(date) => {
                      const hours = date.getHours();
                      const minutes = date.getMinutes();
                      const time = `${hours}:${minutes < 10 ? `0${minutes}` : minutes}`;
                      field.onChange(time);
                    }}
                    showTimeSelect
                    showTimeSelectOnly
                    timeFormat="HH:mm"
                    timeIntervals={10}
                    timeCaption="time"
                    dateFormat="HH:mm"
                    showIcon
                  />
                  {errors && errors.startTime && <ErrorSpan>{errors.startTime[i18n.language]}</ErrorSpan>}
                </FieldWrapper>
              )}
            />
            <Controller
              name="dailyStartTimes.day2"
              control={control}
              render={({ field }) => (
                <FieldWrapper
                  className="carpool-event-form"
                  style={{
                    margin: "8px",
                  }}
                >
                  <FieldLabel label={t("dashboard_commerce.day_2_start_time")} />
                  <DatePicker
                    label="dailyStartTimes.day2"
                    className="input"
                    selected={new Date().setHours(...field?.value?.split(":"))}
                    onChange={(date) => {
                      const hours = date.getHours();
                      const minutes = date.getMinutes();
                      const time = `${hours}:${minutes < 10 ? `0${minutes}` : minutes}`;
                      field.onChange(time);
                    }}
                    showTimeSelect
                    showTimeSelectOnly
                    timeFormat="HH:mm"
                    timeIntervals={10}
                    timeCaption="time"
                    dateFormat="HH:mm"
                    showIcon
                  />
                  {errors && errors.endTime && <ErrorSpan>{errors.endTime[i18n.language]}</ErrorSpan>}
                </FieldWrapper>
              )}
            />
          </Row>

          <Row style={{ margin: 0 }}>
            <Controller
              name="destination"
              control={control}
              render={({ field }) => (
                <FieldWrapper>
                  <div style={{ margin: "8px", width: "205px" }}>
                    <FieldLabel label={t("dashboard_commerce.destination")} />
                    <SearchBox
                      accessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
                      options={
                        {
                          // country: "CA",
                        }
                      }
                      onRetrieve={(ev) => {
                        const feature = ev.features[0];
                        const location = new firebaseInstance.firestore.GeoPoint(
                          feature.geometry.coordinates[1],
                          feature.geometry.coordinates[0]
                        );
                        const name = feature.properties.full_address || "";

                        const destinationData = {
                          name: name,
                          location: location,
                        };

                        field.onChange(destinationData);
                      }}
                      value={field.value.name}
                      onChange={(ev) => {
                        const location = getValues("destination.location");
                        field.onChange({ name: ev, location });
                      }}
                      theme={{
                        cssText: `
                    .SearchBox {
                      box-shadow: none;
                    }
                    .ActionIcon, .SearchIcon {
                      display: none;
                    }
                    .Input {
                      padding: 2px 12px;
                      height: auto;
                      border: 1px solid #ced4da;
                      transition: border-color 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
                    }
                    .Input:focus {
                      box-shadow: rgba(76, 175, 80, 0.25) 0 0 0 0.2rem;
                      border-color: #4caf50;
                    }
                  `,
                      }}
                    />
                    {errors && errors.destination && <ErrorSpan>{errors.destination[i18n.language]}</ErrorSpan>}
                  </div>
                </FieldWrapper>
              )}
            />

            <Controller
              name="destinationDetails"
              control={control}
              render={({ field }) => (
                <FieldWrapper>
                  <TextField
                    label={t("dashboard_commerce.destination_details")}
                    value={field.value}
                    onChange={field.onChange}
                    style={{ width: "auto" }}
                  />
                  {errors && errors.destinationDetails && <ErrorSpan>{errors.destinationDetails[i18n.language]}</ErrorSpan>}
                </FieldWrapper>
              )}
            />
          </Row>

          <Row style={{ margin: 0 }}>
            <Controller
              name="closingDate"
              control={control}
              render={({ field }) => (
                <FieldWrapper
                  className="carpool-event-form"
                  style={{
                    margin: "8px",
                  }}
                >
                  <FieldLabel label={t("dashboard_commerce.closing_date")} />
                  <DatePicker
                    label="closingDate"
                    className="input"
                    selected={field?.value}
                    onChange={(date) => {
                      date.setHours(12);
                      field.onChange(date);
                    }}
                    minDate={new Date()}
                    dateFormat="yyyy/MM/dd"
                    showIcon
                  />
                  {errors && errors.closingDate && <ErrorSpan>{errors.closingDate[i18n.language]}</ErrorSpan>}
                </FieldWrapper>
              )}
            />
            <Controller
              name="lastReminderDate"
              control={control}
              render={({ field }) => (
                <FieldWrapper
                  className="carpool-event-form"
                  style={{
                    margin: "8px",
                  }}
                >
                  <FieldLabel label={t("dashboard_commerce.last_reminder_date")} />
                  <DatePicker
                    label="lastReminderDate"
                    className="input"
                    selected={field?.value}
                    onChange={(date) => {
                      date.setHours(12);
                      field.onChange(date);
                    }}
                    minDate={new Date()}
                    dateFormat="yyyy/MM/dd"
                    showIcon
                  />
                  {errors && errors.lastReminderDate && <ErrorSpan>{errors.lastReminderDate[i18n.language]}</ErrorSpan>}{" "}
                </FieldWrapper>
              )}
            />
          </Row>
          <Row style={{ margin: 0 }}>
            <Controller
              name="maxMinutesDetourDriver"
              control={control}
              render={({ field }) => (
                <FieldWrapper>
                  <TextField
                    label={t("global.driver_detour_time")}
                    value={field.value}
                    type="number"
                    onChange={(e) => {
                      field.onChange(Number(e.target.value));
                    }}
                    style={{ width: "auto" }}
                  />
                  {errors && errors.maxMinutesDetourDriver && (
                    <ErrorSpan style={{ marginLeft: "8px" }}>{errors.maxMinutesDetourDriver[i18n.language]}</ErrorSpan>
                  )}
                </FieldWrapper>
              )}
            />
            <Controller
              name="maxMinutesDetourRider"
              control={control}
              render={({ field }) => (
                <FieldWrapper>
                  <TextField
                    label={t("global.rider_detour_time")}
                    value={field.value}
                    type="number"
                    onChange={(e) => {
                      field.onChange(Number(e.target.value));
                    }}
                    style={{ width: "auto" }}
                  />
                  {errors && errors.maxMinutesDetourRider && (
                    <ErrorSpan style={{ marginLeft: "8px" }}>{errors.maxMinutesDetourRider[i18n.language]}</ErrorSpan>
                  )}
                </FieldWrapper>
              )}
            />
          </Row>
          <Row style={{ margin: 0 }}>
            <Controller
              name="maxMatchPerUser"
              control={control}
              render={({ field }) => (
                <FieldWrapper>
                  <TextField
                    label={t("global.max_match_per_user")}
                    value={field.value}
                    type="number"
                    onChange={(e) => {
                      field.onChange(Number(e.target.value));
                    }}
                    style={{ width: "auto" }}
                  />
                  {errors && errors.maxMatchPerUser && <ErrorSpan style={{ marginLeft: "8px" }}>{errors.maxMatchPerUser[i18n.language]}</ErrorSpan>}
                </FieldWrapper>
              )}
            />
          </Row>
          <Button color="primary" type="submit" style={{ margin: "10px" }} disabled={submitDisabled}>
            {t("forms.submit")}
          </Button>
        </Form>
      </Collapse>
    </div>
  );
};

export default CarpoolEventForm;
