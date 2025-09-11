import React from "react";
import { Col } from "reactstrap";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Carousel,
  CarouselItem,
  CarouselControl,
  CarouselIndicators,
  CardBody,
} from "reactstrap";

import { useAuth } from "../../../shared/providers/AuthProvider";
import { ChallengePreviewSkeleton } from "./Skeletons";
import ChallengePreviewCard from "../../Challenge/ChallengePreviewCard";
import { routes } from "../../App/Router";
import CardBox from "atomicComponents/CardBox";
import { useEffect } from "react";
import { useMemo } from "react";
import { useState } from "react";
import { useCallback } from "react";
import ChallengeViewModel from "containers/Challenge/ChallengeViewModel";
import { isUserOrganisationSelector } from "redux/selectors/user";
import { useSelector } from "react-redux";
//import ChallengeViewModel from "containers/Challenge/ChallengeViewModel";

export default function Challenges() {
  const [t] = useTranslation("common");
  const [userID] = useAuth();

  const isOrganisation = useSelector(isUserOrganisationSelector);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [completeChallengesStats, setCompleteChallengesStats] = useState({})

  const challengeViewModel = useMemo(
    () => new ChallengeViewModel(userID, t, isOrganisation),
    [t, userID]
  );

  const setAllCompleteChallengesStats = useCallback(
    async (challenges) => {
      if (!challenges) {
        return;
      }
      //         
      const getCompleteDataPromises = challenges.map(challenge => {
        return challengeViewModel
          .getCompleteChallengeWithId(challenge.id)

          .then((returnedChallenge) => {
            setCompleteChallengesStats(prev => {
              return {
                ...prev,
                [challenge.id]: {
                  challengeInfo: returnedChallenge?.info,
                  challengeStats: returnedChallenge?.stats,
                  challengeLeaderboard: returnedChallenge?.leaderboard,
                }
              }
            })
          })
          .catch((error) => {
            console.error('error in ChallengesPreview:', error);
          })
      });

      Promise.all(getCompleteDataPromises)
    },
    [challengeViewModel],
  )
  useEffect(() => {
    let isUnmounted = false;

    const fetchChallenges = async () => {
      try {
        setLoading(true);
        const nearestChallenges = await challengeViewModel.getNearestChallengesWithLimit(3);

        if (isUnmounted) return; // Exit early if the component is unmounted

        const filteredChallenges = nearestChallenges.docs.filter(doc => {
          const data = doc.data();

          return data.status === "accepted" || data.status === undefined;
        });

        const formattedChallenges = await challengeViewModel.formatChallengesInfoWithStats(filteredChallenges);

        if (isUnmounted) return; // Exit early if the component is unmounted

        setChallenges(formattedChallenges);
        setAllCompleteChallengesStats(nearestChallenges.docs);
      } catch (error) {
        if (!isUnmounted) {
          console.log("Statistics fetch error", error);
        }
      } finally {
        if (!isUnmounted) {
          setLoading(false);
        }
      }
    };

    fetchChallenges();

    return () => {
      isUnmounted = true;
    };
  }, [challengeViewModel, setAllCompleteChallengesStats]);

  // Card Carousel
  const next = () => {
    if (animating) return;
    const nextIndex =
      activeIndex === challenges.length - 1 ? 0 : activeIndex + 1;
    setActiveIndex(nextIndex);
  };
  const previous = () => {
    if (animating) return;
    const nextIndex =
      activeIndex === 0 ? challenges.length - 1 : activeIndex - 1;
    setActiveIndex(nextIndex);
  };

  const goToIndex = (newIndex) => {
    if (animating) return;
    setActiveIndex(newIndex);
  };

  const slides = useMemo(
    () =>
      challenges?.map((challenge, key) => {
        return (
          <CarouselItem onExiting={() => setAnimating(true)} onExited={() => setAnimating(false)} key={key}>
            <ChallengePreviewCard
              challenge={challenge}
              key={challenge.id}
              withExportLeaderboard
              leaderboardUsers={
                completeChallengesStats[challenge.id]
                  ? completeChallengesStats[challenge.id].challengeLeaderboard?.users
                  : {}
              }
            />
          </CarouselItem>
        );
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [completeChallengesStats]
  );

  return (
    <Col sm={12} className="p-0">
      <CardBox style={{ marginBottom: '30px' }}>
        <div className="card__title d-flex align-items-center justify-content-between">
          <h5 className="bold-text text-left challenge-title">
            {t("dashboard_fitness.my_challenges")}
          </h5>

          <Link to={routes.city.challengeDashboard}>
            <span>{t("dashboard_fitness.more_challenges")}</span>
          </Link>
        </div>
        {!loading ? (
          Array.isArray(challenges) && challenges.length > 0 ? (
            <Carousel
              dark="true"
              activeIndex={activeIndex}
              next={next}
              previous={previous}
            >
              <CarouselIndicators
                items={challenges}
                activeIndex={activeIndex}
                onClickHandler={goToIndex}
                className="carousel-indicators"
              />
              {slides}
              <CarouselControl
                direction="prev"
                directionText="Previous"
                onClickHandler={previous}
                className="carousel-control"
              />
              <CarouselControl
                direction="next"
                directionText="Next"
                onClickHandler={next}
                className="carousel-control"
              />
            </Carousel>
          ) : (
            <CardBody
              className="dashboard__health-chart dashboard__health-chart-card"
              style={{
                padding: "1rem 1.5rem",
              }}
            >
              <span>{t("dashboard_fitness.no_challenges")}</span>
            </CardBody>
          )
        ) : (
          <ChallengePreviewSkeleton />
        )}
      </CardBox>
    </Col>
  );
}
