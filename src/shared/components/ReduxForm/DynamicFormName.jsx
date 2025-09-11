import React from 'react';
import { connect } from 'react-redux';
import { destroy } from 'redux-form';

/**
 * Automatically generate a new form name every time the component is created.
 *
 * @param formNamePrefix The prefix that will be used to generate the form name.
 */
export const DynamicFormName = ({ formNamePrefix }) => ComponentWithReduxForm =>
    connect(
        null,
        { destroy },
    )(class WithDynamicFormName extends React.Component {
        static idCounter = 1;

        id;
        formName;

        constructor(props) {
            super(props);
            this.id = WithDynamicFormName.idCounter++;
            this.formName = `${formNamePrefix}-${this.id}`;
        }

        /**
         * It is necessary to destroy the form again because the "submitSucceeded" property is left
         * if the form is submitted and the component is destroyed right after.
         */
        componentWillUnmount() {
            // It is necessary to use the "setTimeout" so the form destruction can occur after
            // "submitSucceeded" is set. Otherwise, this garbage will be left in the redux store.
            setTimeout(() => {
                this.props.destroy(this.formName);
            }, 0);
        }

        render() {
            return (
                <ComponentWithReduxForm
                {...this.props}
                form={this.formName}
                />
            );
        }
    });
