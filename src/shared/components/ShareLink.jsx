import CardBox from "atomicComponents/CardBox";
import { useTranslation } from "react-i18next";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import styled from "styled-components";
import ReactTooltip from "react-tooltip";
import { useState } from "react";

const CopyIcon = styled(FileCopyIcon)`
  cursor: pointer;
`;

const Link = styled.a`
  &:hover {
    text-decoration: underline;
  }
`;

export default function ShareLink({ link, entity }) {
  const { t } = useTranslation("common");
  const [tooltipText, setTooltipText] = useState("Copy");

  return (
    <CardBox>
      {entity == "tenant" ? t("account.profile.shareLink_tenant") : t("account.profile.shareLink_org")}
      :{" "}
      <Link href={link} target="_blank" rel="noreferrer">
        {link}
      </Link>{" "}
      <CopyIcon
        fontSize="small"
        title="Copy"
        onClick={() => {
          navigator.clipboard.writeText(link);
          setTooltipText("Copied");
        }}
        data-tip
        data-for="copy-link-icon"
      ></CopyIcon>
      <ReactTooltip id="copy-link-icon" aria-haspopup="true" type="light">
        <p>{tooltipText}</p>
      </ReactTooltip>
      <div><strong>Vous devez être déconnecté pour utiliser ce lien vous même</strong></div>
    </CardBox>
  );
}


export function ShareLinkOrg({ link, entity }) {
  const { t } = useTranslation("common");
  const [tooltipText, setTooltipText] = useState("Copy");

  return (
    <CardBox>
      {t("account.profile.shareLink_org_first")}{": "}
      <Link href={link} target="_blank" rel="noreferrer">
        {link}
      </Link>{" "}
      <CopyIcon
        fontSize="small"
        title="Copy"
        onClick={() => {
          navigator.clipboard.writeText(link);
          setTooltipText("Copied");
        }}
        data-tip
        data-for="copy-link-icon"
      ></CopyIcon>
      <ReactTooltip id="copy-link-icon" aria-haspopup="true" type="light">
        <p>{tooltipText}</p>
      </ReactTooltip>
      <div><strong>Ouvrez une fenêtre en navigation privée pour utiliser ce lien</strong></div>
    </CardBox>
  );
}

