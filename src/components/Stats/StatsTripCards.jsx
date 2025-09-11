import React, { Fragment, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Col, Row, Container } from "reactstrap";
import styled from "styled-components";
import { useTable } from "react-table";
import OrganisationDashboardViewModel from "../../containers/Dashboards/Organisation/components/DashboardViewModel";
import { useAuth } from "../../shared/providers/AuthProvider";
import { ListSkeleton } from "./Skeletons";

import MetroIcon from "../../assets/icons/transport_mode/metro.svg";
import RunIcon from "../../assets/icons/transport_mode/run.svg";
import CarpoolIcon from "../../assets/icons/transport_mode/carpool.svg";
import AutoBusIcon from "../../assets/icons/transport_mode/bus.svg";
//import CarIcon from "../../assets/icons/transport_mode/greenplay_icônes_car.png";
import TrainIcon from "../../assets/icons/transport_mode/train.svg";
import VeloIcon from "../../assets/icons/transport_mode/bike.svg";
import WalkIcon from "../../assets/icons/transport_mode/walk.svg";
import RemoteIcon from "../../assets/icons/transport_mode/wfh.svg";

import CardBox from "atomicComponents/CardBox";

const Wrapper = styled.div`
  overflow-x: auto;
  table {
    border-spacing: 0;

    th {
      margin: 0;
      padding: 0rem 1rem;
    }
    td {
      margin: 0;
      padding: 0.5rem 0.5rem;
      border-bottom: 1px solid #d3d3d3;
    }
  }
`;

const transportData = [
  [
    {
      type: "metro",
      icon: MetroIcon,
      sessionCount: 0,
      totalGreenhouseGazes: 0 + " kg",
    },
    {
      type: "bus",
      icon: AutoBusIcon,
      sessionCount: 0,
      totalGreenhouseGazes: 0 + " kg",
    },
  ],
  [
    {
      type: "run",
      icon: RunIcon,
      sessionCount: 0,
      totalGreenhouseGazes: 0 + " kg",
    },
    {
      type: "carpool",
      icon: CarpoolIcon,
      sessionCount: 0,
      totalGreenhouseGazes: 0 + " kg",
    },
  ],
  [
    {
      type: "wfh",
      icon: RemoteIcon,
      sessionCount: 0,
      totalGreenhouseGazes: 0 + " kg",
    },
    {
      type: "train",
      icon: TrainIcon,
      sessionCount: 0,
      totalGreenhouseGazes: 0 + " kg",
    },
  ],
  [
    {
      type: "bike",
      icon: VeloIcon,
      sessionCount: 0,
      totalGreenhouseGazes: 0 + " kg",
    },
    {
      type: "walk",
      icon: WalkIcon,
      sessionCount: 0,
      totalGreenhouseGazes: 0 + " kg",
    },
  ],
];

const TransportTable = ({ columns, data }) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({
    columns,
    data,
  });

  const [t] = useTranslation("common");

  return (
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps()}>{column.render("Header")}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row);

          return (
            <tr key={i}>
              {row.original.map((item, i) => {
                let typet = item.type;

                let stringModeOfTransport = "modeOfTransport." + typet

                return (
                  <Fragment key={i}>
                    <td key={i}>
                      <h4>{t(stringModeOfTransport)}</h4> 
                      <img
                        src={item.icon}
                        alt="challenge.img"
                        style={{
                          width: "4rem",
                          height: "4rem",
                          marginRight: "0.5rem",
                          objectFit: "cover",
                         // borderRadius: "50%",
                        }}
                      />
                    </td>
                    <td>
                      <p className="bold-text text-center">
                        {item.totalGreenhouseGazes}
                      </p>
                    </td>
                    <td>
                      <p className="bold-text text-center">
                        {item.sessionCount}
                      </p>
                    </td>
                  </Fragment>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

const prepareTransportStat = (item, props = {}) => ({
  ...props,
  sessionCount: item?.sessionCount || 0,
  totalGreenhouseGazes: item?.totalGreenhouseGazes?.toFixed(2) || 0,
  totalDistance: item?.totalDistance || 0,
});

const StatsTripCards = ({ tripStats, isLoading }) => {
  const [t] = useTranslation('common');
  const [userID] = useAuth();
  const dashboardViewModel = useMemo(
    () => new OrganisationDashboardViewModel(userID),
    [userID]
  );
  
  const transportGroups = useMemo(() => transportData.map((group) => {
    const [group1, group2] = group;
    const group1Data = tripStats?.[group1.type];
    const group2Data = tripStats?.[group2.type];

    return [
      prepareTransportStat(group1Data, group1),
      prepareTransportStat(group2Data, group2)
    ];
  }), [tripStats]);

  const columns = React.useMemo(
    () => dashboardViewModel.transportColumnData(t),
    [dashboardViewModel, t]
  );

  return (
    <Container>
      <Row>
        <Col className="card">
          <CardBox>
            {!isLoading ? (
              <Wrapper>
                <TransportTable columns={columns} data={transportGroups} />
              </Wrapper>
            ) : (
              <ListSkeleton />
            )}
          </CardBox>
        </Col>
      </Row>
    </Container>
  );
}

export default StatsTripCards;
