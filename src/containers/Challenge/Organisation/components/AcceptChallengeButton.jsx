import React, { useCallback } from 'react';
import { Button } from 'reactstrap';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SENT_CHALLENGE_STATUSES } from 'constants/statuses';
import { routes } from 'containers/App/Router';
import ConfirmWindow from 'shared/components/Modal/ConfirmWindow';

const AcceptChallengeButton = ({ challengeId, anotherOrganisationChallengeViewModel, myChallengeViewModel, status }) => {
    const [t, i18n] = useTranslation("common");
    const history = useHistory();

    const disabledButton = !(status == SENT_CHALLENGE_STATUSES.active)

    const handleAcceptSendedChallenge = useCallback(async () => {
        let updateData = {
            status: SENT_CHALLENGE_STATUSES.accepted,
        };

        const thisChallengeInAnotherOrganisation = await anotherOrganisationChallengeViewModel.getChallengeInfoWithId(
            challengeId
        );

        const anotherOrgAcceptChallenge = thisChallengeInAnotherOrganisation?.status === SENT_CHALLENGE_STATUSES.accepted;
        if (anotherOrgAcceptChallenge) {
            updateData = {
                activeChallenge: true,
                status: SENT_CHALLENGE_STATUSES.accepted,
            };
        }
        Promise.all([
            ...(anotherOrgAcceptChallenge
                ? [anotherOrganisationChallengeViewModel.updateChallengeFields(challengeId, updateData)]
                : []),
            myChallengeViewModel.updateChallengeFields(challengeId, updateData),
        ])
            .then(() => {
                toast.success(t("challenge.message.success_accept"));
                setTimeout(() => {
                    history.push(routes.organisation.challengeDashboard);
                }, 1000);
            })
            .catch((error) => {
                console.error("Error deleting document: ", error);
                toast.error(t("challenge.message.error_delete"));
            });
    }, [anotherOrganisationChallengeViewModel, challengeId, history, myChallengeViewModel, t]);

    return (
        <ConfirmWindow
            confirmTitle={t('admin.accept_challenge_confirm_title')}
            confirmText={t('admin.accept_challenge_confirm_description')}
            handleConfirmClick={handleAcceptSendedChallenge}
            Button={Button}
            disabledButton={disabledButton}
            buttonText={disabledButton ? status == SENT_CHALLENGE_STATUSES.cancelled ? t("challenge.status.cancelled") : t("challenge.challenge_accepted") : t("global.accept_challenge")}
            buttonProps={{
                color: disabledButton ? '#7f7f7f' : "primary",
                className: "mb-0",

            }} />

    )

};

export default AcceptChallengeButton;
