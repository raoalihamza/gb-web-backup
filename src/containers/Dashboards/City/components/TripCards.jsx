import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { useTable } from "react-table";
import DashboardViewModel from "./DashboardViewModal";
import { useAuth } from "../../../../shared/providers/AuthProvider";
import { ListSkeleton } from "../../components/Skeletons";

import metroIcon from "../../../../assets/icons/greenplay_icônes_Metro.png";
import runIcon from "../../../../assets/icons/greenplay_icônes_run.png";
import carpoolIcon from "../../../../assets/icons/greenplay_icônes_Carpool.png";
import autoBusIcon from "../../../../assets/icons/greenplay_icônes_Autobus.png";
import carIcon from "../../../../assets/icons/greenplay_icônes_car.png";
import trainIcon from "../../../../assets/icons/greenplay_icônes_Train.png";
import veloIcon from "../../../../assets/icons/greenplay_icônes_velo.png";
import walkIcon from "../../../../assets/icons/greenplay_icônes_walk.png";

import dsaMetroIcon from "../../../../assets/icons/transport_mode/metro.svg";
import dsaRunIcon from "../../../../assets/icons/transport_mode/run.svg";
import dsaCarpoolIcon from "../../../../assets/icons/transport_mode/carpool.svg";
import dsaAutoBusIcon from "../../../../assets/icons/transport_mode/bus.svg";
import dsaTrainIcon from "../../../../assets/icons/transport_mode/train.svg";
import dsaVeloIcon from "../../../../assets/icons/transport_mode/bike.svg";
import dsaWalkIcon from "../../../../assets/icons/transport_mode/walk.svg";
import dsaRemoteIcon from "../../../../assets/icons/transport_mode/wfh.svg";
import CardBox from "atomicComponents/CardBox";

const Style = styled.div`
  padding: 0.5rem;

  table {
    border-spacing: 0;
    width: 100%;
    text-align: center; /* Centre le texte des cellules */

    th, td {
      margin: 0;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #d3d3d3;
      vertical-align: middle; /* Assure que les images sont alignées verticalement au milieu */
    }

    td {
      img {
        display: block; /* Assure que les images sont centrées dans la cellule */
        margin: 0 auto;
      }
    }
  }
`;

const isDsa = process.env.REACT_APP_FIREBASE_PROJECT_ID === "defisansautosolo-17ee7";

const transportData = [
  {
    type: "metro",
    icon: isDsa ? dsaMetroIcon : metroIcon,
    sessionCount: 0,
    distance: 0,
    totalGreenhouseGazes: "0 kg",
  },
  {
    type: "bus",
    icon: isDsa ? dsaAutoBusIcon : autoBusIcon,
    sessionCount: 0,
    distance: 0,
    totalGreenhouseGazes: "0 kg",
  },
  {
    type: "run",
    icon: isDsa ? dsaRunIcon : runIcon,
    sessionCount: 0,
    distance: 0,
    totalGreenhouseGazes: "0 kg",
  },
  {
    type: "carpool",
    icon: isDsa ? dsaCarpoolIcon : carpoolIcon,
    sessionCount: 0,
    distance: 0,
    totalGreenhouseGazes: "0 kg",
  },
  {
    type: isDsa ? "wfh" : "car",
    icon: isDsa ? dsaRemoteIcon : carIcon,
    sessionCount: 0,
    distance: 0,
    totalGreenhouseGazes: "0 kg",
  },
  {
    type: "train",
    icon: isDsa ? dsaTrainIcon : trainIcon,
    sessionCount: 0,
    distance: 0,
    totalGreenhouseGazes: "0 kg",
  },
  {
    type: "bike",
    icon: isDsa ? dsaVeloIcon : veloIcon,
    sessionCount: 0,
    distance: 0,
    totalGreenhouseGazes: "0 kg",
  },
  {
    type: "walk",
    icon: isDsa ? dsaWalkIcon : walkIcon,
    sessionCount: 0,
    distance: 0,
    totalGreenhouseGazes: "0 kg",
  },
];

const TransportTable = ({ columns, data }) => {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({
      columns,
      data,
    });

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
        {rows.map((row) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map((cell) => (
                <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default function TripCards({ activities, loading }) {
  const [t] = useTranslation("common");
  const [userID] = useAuth();
  const [transport, setTransport] = React.useState(transportData);
  const dashboardViewModel = React.useMemo(
    () => new DashboardViewModel(userID),
    [userID]
  );

  React.useEffect(() => {
    setTransport(transportData);
    const keys = Object.keys(activities || {});

    keys.forEach((key) => {
      setTransport((prevState) => {
        return prevState.map((item) => {
          if (item.type === key) {
            return {
              ...item,
              sessionCount: activities[key]?.sessionCount || 0,
              totalGreenhouseGazes:
                activities[key]?.totalGreenhouseGazes?.toFixed(2) || "0 kg",
              totalDistance: activities[key]?.totalDistance || 0,
            };
          }
          return item;
        });
      });
    });
  }, [activities]);

  const columns = React.useMemo(
    () => [

      {
        Header: "",
        accessor: "icon",
        Cell: ({ cell: { value } }) => (
          <img
            src={value}
            alt={value}
            style={{
              width: "3rem",
              height: "3rem",
              objectFit: "cover",
              borderRadius: "50%",
            }}
          />
        ),
      },
      {
        Header: t("challenge_goals.totalGreenhouseGazes"),
        accessor: "totalGreenhouseGazes",
      },
      {
        Header: t("challenge_goals.totalDistance"),
        accessor: "totalDistance",
        Cell: ({ cell: { value } }) => `${Math.round(value / 1000) || 0} km`,
      },
      {
        Header: t("challenge_goals.sessionCount"),
        accessor: "sessionCount",
      },
    ],
    [t]
  );

  return (
    <CardBox padding="15px">
      <div className="card-body">
        {!loading ? (
          <Style>
            <TransportTable columns={columns} data={transport} />
          </Style>
        ) : (
          <ListSkeleton />
        )}
      </div>
    </CardBox>
  );
}
