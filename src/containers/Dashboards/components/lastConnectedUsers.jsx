import React, { useEffect, useMemo, useState } from "react";
import { Col, Card, Row, Dropdown, DropdownToggle } from "reactstrap";
import { useTranslation } from "react-i18next";
import dateUtils from "utils/dateUtils";
import CardBox from "atomicComponents/CardBox";
import CollapseComponent from "shared/components/Collapse";
import { firebaseInstance, firestore } from "containers/firebase";
import { firestoreToArray } from "services/helpers";

function LastConnectedUsers({ users }) {
  const [t] = useTranslation("common");

  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);
  const [statuses, setStatuses] = useState([]);
//   console.log("users", users);
//   console.log("statuses", statuses);
  useEffect(() => {
    if (!users || users.length === 0) {
      setStatuses([]);
      return;
    }

    const chunkSize = 10;
    const unSubscribers = [];
    // We'll merge the results from all listeners into this map.

    for (let i = 0; i < users.length; i += chunkSize) {
      const chunk = users.slice(i, i + chunkSize).map((i) => i.id);
      // Query by document ID using the FieldPath.documentId() helper.
      const query = firestore
        .collection("status")
        .where(firebaseInstance.firestore.FieldPath.documentId(), "in", chunk);

      const unsubscribe = query.onSnapshot((snapshot) => {
        const statuses = firestoreToArray(snapshot);
        setStatuses((prev) => {
          const mergedMap = new Map();

          prev.forEach((item) => {
            mergedMap.set(item.id, item);
          });

          statuses.forEach((item) => {
            mergedMap.set(item.id, item);
          });

          return Array.from(mergedMap.values());
        });
      });

      unSubscribers.push(unsubscribe);
    }

    // Cleanup all listeners when the component unmounts or statusIds change.
    return () => {
      unSubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [users]);

  const usersWithOnlineStatus = useMemo(() => {
    const statusesMap = {};
    statuses.forEach((i) => {
      statusesMap[i.id] = i;
    });
    return users.map((user) => ({ ...user, isOnline: statusesMap[user.id]?.state === "online" }));
  }, [statuses, users]);

  return (
    <Card>
      <Dropdown isOpen={isOpen} toggle={toggle}>
        <DropdownToggle caret className="filter-dropdown-toggle ml-2 mb-0">
          {t("dashboard_commerce.users_last_connections")}
        </DropdownToggle>
        {isOpen && (
          <CardBox>
            <div className="profile__information">
              <div className="profile__data">
                <h5 className="bold-text text-left challenge-title">
                  {t("dashboard_commerce.users_last_connections")}
                </h5>
                <br></br>
                <Col>
                  {users.length === 0 ? (
                    <p>{t("email.loading")}</p>
                  ) : (
                    usersWithOnlineStatus.map((user) =>
                      user.loginHistory ? (
                        <div key={user.id}>
                          <Row>
                            <Col>
                              <CollapseComponent
                                title={
                                  <span>
                                    {user.firstName} {user.lastName}
                                    <span
                                      style={{
                                        color: user.isOnline ? "green" : "red",
                                        backgroundColor: user.isOnline ? "green" : "red",
                                        display: "inline-block",
                                        width: "10px",
                                        height: "10px",
                                        borderRadius: "50%",
                                        marginLeft: "5px",
                                      }}
                                    ></span>
                                  </span>
                                }
                              >
                                {user.loginHistory &&
                                  Object.entries(user.loginHistory)
                                    .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA)) // Trier les dates en ordre décroissant
                                    .map(([date, timestamp]) => (
                                      <p key={date}>
                                        {date}:{" "}
                                        {dateUtils.formatDateFrCAConnected(
                                          dateUtils.convertFirestoreTimestamp(timestamp)
                                        )}
                                      </p>
                                    ))}
                              </CollapseComponent>
                            </Col>
                          </Row>
                          <br></br>
                        </div>
                      ) : null
                    )
                  )}
                </Col>
              </div>
            </div>
          </CardBox>
        )}
      </Dropdown>
    </Card>
  );
}

export default LastConnectedUsers;
