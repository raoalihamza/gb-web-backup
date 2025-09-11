/* eslint-disable */

import ChallengeViewModel from '../../../containers/Challenge/ChallengeViewModel';
import { store } from '../../../redux/store';

store.getState = jest.fn();

const translation = jest.fn();
const toDate = jest.fn();
const getFn = jest.fn();
const addFn = jest.fn();
const updateFn = jest.fn();
const deleteFn = jest.fn();
const mockedFirestoreFunctions = () => ({
    collection: mockedFirestoreFunctions,
    doc: mockedFirestoreFunctions,
    where: mockedFirestoreFunctions,
    orderBy: mockedFirestoreFunctions,
    limit: mockedFirestoreFunctions,
    get: getFn,
    add: addFn,
    update: updateFn,
    delete: deleteFn,
});

const AN_ID = '1234567890';
const A_DATE = new Date();
const TARGETS = [{ select: { label: "challenge_goals.time", value: 'time' }, value: 20 }];
const GOALS = { mainTarget: "totalTime", totalTime: 20 };
const ACTIVITY_TYPES_DATA = ['bus', 'metro'];
const ACTIVITY_TYPES = [
    { label: 'modeOfTransport.bus', value: 'bus' },
    { label: 'modeOfTransport.metro', value: 'metro' }
];
const BRANCH = { value: 'branch_value', label: 'branch_label' };
const IN_STORE_BRANCH = { branch: { branches: { [BRANCH.value]: BRANCH.label } } }
const CHALLENGE_DATA = {
    name: 'name',
    startAt: { toDate },
    endAt: { toDate },
    description: 'desc',
    rewardGreenPoints: '15',
    activeChallenge: true,
    eligibility: {
        session: {
            startTime: '600',
            endTime: '830',
            activityTypes: ACTIVITY_TYPES_DATA
        }
    },
    orgTargets: GOALS,
    targets: GOALS,
    branchId: BRANCH.value
};
const FIRESTORE_CHALLENGE = {
    data: () => CHALLENGE_DATA,
    uselessStuff: 'should not be kept',
    id: AN_ID,
};
const A_CHALLENGE = {
    ChallengeName: 'name',
    startDate: new Date('1995-12-17T03:24:00'),
    endDate: new Date('1995-12-18T03:24:00'),
    ChallengeDescription: 'desc',
    ScheduleStart: { format: () => '324' },
    ScheduleEnd: { format: () => '624' },
    reward: 46,
    activeChallenge: false,
    activityType: ACTIVITY_TYPES,
    CollaborativeGoals: TARGETS,
    individualGoals: TARGETS,
    Branch: BRANCH
};

const challengeVM = new ChallengeViewModel('allo', translation);
challengeVM.firestore.collection = mockedFirestoreFunctions;
challengeVM.organisationRef.collection = mockedFirestoreFunctions;

describe('getChallengeInfoWithId', () => {
    let dataToChallenge;

    beforeAll(() => {
        dataToChallenge = jest.spyOn(challengeVM, 'dataToChallenge').mockImplementation();
    });

    afterAll(() => {
        dataToChallenge.mockRestore();
    });

    describe('Given id', () => {
        const id = AN_ID;

        describe('When getting challenge info', () => {
            let promise;

            beforeEach(() => {
                getFn.mockClear();
                getFn.mockImplementationOnce(() => FIRESTORE_CHALLENGE);
                promise = challengeVM.getChallengeInfoWithId(id);
            });

            test('Then firestore\'s get function will called once',
                done => {
                    promise.then(() => {
                        expect(getFn).toBeCalledTimes(1);
                        done();
                    })
                        .catch((error) => done(error));
                }
            );

            test('Then the returned challenge should be formated',
                done => {
                    promise.then(() => {
                        expect(dataToChallenge).toBeCalledWith(CHALLENGE_DATA);
                        done();
                    })
                        .catch((error) => done(error));
                }
            );
        });
    });
});

describe('dataToChallenge', () => {
    let goalsToTargets;

    beforeAll(() => {
        goalsToTargets = jest.spyOn(challengeVM, 'goalsToTargets').mockImplementation();
    });

    afterAll(() => {
        goalsToTargets.mockRestore();
    });

    describe('Given challenge data', () => {
        const challengeData = CHALLENGE_DATA;

        describe('When converting data to challenge', () => {
            let result;

            beforeEach(() => {
                store.getState.mockClear();
                toDate.mockClear();
                goalsToTargets.mockClear();
                store.getState.mockImplementation(() => IN_STORE_BRANCH);
                toDate.mockImplementation(() => A_DATE);
                goalsToTargets.mockImplementation(() => TARGETS);
                result = challengeVM.dataToChallenge(challengeData);
            });

            test('Then the challenge should be formated correctly',
                () => {
                    expect(result.ChallengeName).toBe('name');
                    expect(result.startDate).toEqual(A_DATE);
                    expect(result.endDate).toEqual(A_DATE);
                    expect(result.ChallengeDescription).toBe('desc');
                    expect(result.ScheduleStart.hour()).toBe(6);
                    expect(result.ScheduleStart.minute()).toBe(0);
                    expect(result.ScheduleEnd.hour()).toBe(8);
                    expect(result.ScheduleEnd.minute()).toBe(30);
                    expect(result.reward).toBe('15');
                    expect(result.activeChallenge).toBeTruthy();
                    expect(result.activityType).toEqual(ACTIVITY_TYPES);
                    expect(result.CollaborativeGoals).toEqual(TARGETS);
                    expect(result.individualGoals).toEqual(TARGETS);
                    expect(result.Branch).toEqual(BRANCH);
                }
            );
        });
    });
});

describe('getCompleteChallengeWithId', () => {
    let dataToChallenge;

    beforeAll(() => {
        dataToChallenge = jest.spyOn(challengeVM, 'dataToChallenge').mockImplementation();
    });

    afterAll(() => {
        dataToChallenge.mockRestore();
    });

    describe('Given id', () => {
        const id = AN_ID;

        describe('When getting all challenge data', () => {
            let promise;

            beforeEach(() => {
                getFn.mockClear();
                getFn.mockImplementation(() => ({ data: () => { } }));
                promise = challengeVM.getCompleteChallengeWithId(id);
            });

            test('Then firestore\'s get function will call 3 times',
                done => {
                    promise.then(() => {
                        expect(getFn).toBeCalledTimes(3);
                        done();
                    })
                        .catch((error) => done(error));
                }
            );
        });
    });
});

describe('updateChallenge', () => {
    let challengeToData;

    beforeAll(() => {
        challengeToData = jest.spyOn(challengeVM, 'challengeToData');
    });

    afterAll(() => {
        challengeToData.mockRestore();
    });

    describe('Given id and challenge values', () => {
        const values = A_CHALLENGE;
        const id = AN_ID;

        describe('When updating challenge', () => {
            let promise;

            beforeEach(() => {
                challengeToData.mockClear();
                challengeToData.mockImplementationOnce(() => CHALLENGE_DATA);
                promise = challengeVM.updateChallenge(id, values);
            });

            test('Then challenge should be formated into data',
                done => {
                    promise.then(() => {
                        expect(challengeToData).toBeCalledWith(A_CHALLENGE);
                        done();
                    })
                        .catch((error) => done(error));
                }
            );

            test('Then firestore\'s update function will call once',
                done => {
                    promise.then(() => {
                        expect(updateFn).toBeCalledWith(expect.objectContaining(CHALLENGE_DATA));
                        done();
                    })
                        .catch((error) => done(error));
                }
            );
        });
    });
});

describe('createChallenge', () => {
    let challengeToData;

    beforeAll(() => {
        challengeToData = jest.spyOn(challengeVM, 'challengeToData');
    });

    afterAll(() => {
        challengeToData.mockRestore();
    });

    describe('Given challenge values', () => {
        const values = A_CHALLENGE;

        describe('When creating challenge', () => {
            let promise;

            beforeEach(() => {
                challengeToData.mockClear();
                challengeToData.mockImplementationOnce(() => CHALLENGE_DATA);
                promise = challengeVM.createChallenge(values);
            });

            test('Then challenge should be formated into data',
                done => {
                    promise.then(() => {
                        expect(challengeToData).toBeCalledWith(A_CHALLENGE);
                        done();
                    })
                        .catch((error) => done(error));
                }
            );

            test('Then firestore\'s add function will call once',
                done => {
                    promise.then(() => {
                        expect(addFn).toBeCalledWith(expect.objectContaining(CHALLENGE_DATA));
                        done();
                    })
                        .catch((error) => done(error));
                }
            );
        });
    });
});

describe('challengeToData', () => {
    let targetsToGoals;

    beforeAll(() => {
        targetsToGoals = jest.spyOn(challengeVM, 'targetsToGoals').mockImplementation();
    });

    afterAll(() => {
        targetsToGoals.mockRestore();
    });

    describe('Given a challenge', () => {
        const challenge = A_CHALLENGE;

        describe('When converting challenge to data', () => {
            let result;

            beforeEach(() => {
                targetsToGoals.mockClear();
                targetsToGoals.mockImplementation(() => GOALS);
                result = challengeVM.challengeToData(challenge)
            });

            test('Then the data should be formated correctly',
                () => {
                    expect(result.name).toBe('name');
                    const expectedStartDate = new Date('1995-12-17T00:00:00.000');
                    expect(result.startAt).toEqual(expectedStartDate);
                    const expectedEndDate = new Date('1995-12-18T23:59:59.999');
                    expect(result.endAt).toEqual(expectedEndDate);
                    expect(result['eligibility.session.startTime']).toBe(324);
                    expect(result['eligibility.session.endTime']).toBe(624);
                    expect(result['eligibility.session.activityTypes']).toEqual(ACTIVITY_TYPES_DATA);
                    expect(result.description).toBe('desc');
                    expect(result.rewardGreenPoints).toBe(46);
                    expect(result.activeChallenge).toBeFalsy();
                    expect(result.orgTargets).toEqual(GOALS);
                    expect(result.targets).toEqual(GOALS);
                    expect(result.branchId).toEqual(BRANCH.value);
                }
            );
        });
    });
});

describe('deleteChallenge', () => {
    describe('Given id', () => {
        const id = AN_ID;

        describe('When deleting a challenge', () => {
            let promise;

            beforeEach(() => promise = challengeVM.deleteChallenge(id));

            test('Then firestore\'s delete function will call once',
                done => {
                    promise.then(() => {
                        expect(deleteFn).toBeCalledTimes(1);
                        done();
                    })
                        .catch((error) => done(error));
                }
            );
        });
    });
});

describe('targetsToGoals', () => {
    describe('Given targets', () => {
        const targets = TARGETS;

        describe('When converting targets to goals', () => {
            let result;

            beforeEach(() => result = challengeVM.targetsToGoals(targets));

            test('Then returns correct goals',
                () => {
                    const expected_result = GOALS;
                    expect(result).toEqual(expected_result);
                }
            );
        });
    });
});

describe('goalsToTargets', () => {
    describe('Given goals', () => {
        const goals = GOALS;

        describe('When converting goals to targets', () => {
            let result;

            beforeEach(() => {
                translation.mockClear();
                translation.mockImplementation(() => "time");
                result = challengeVM.goalsToTargets(goals)
            });

            test('Then returns correct targets',
                () => {
                    const expected_result = TARGETS;
                    expect(result).toEqual(expected_result);
                }
            );
        });
    });
});

describe('formatTargets', () => {
    let targetsToGoals;

    beforeAll(() => {
        targetsToGoals = jest.spyOn(challengeVM, 'targetsToGoals').mockImplementation();
    });

    afterAll(() => {
        targetsToGoals.mockRestore();
    });

    describe('Given targets', () => {
        const targets = TARGETS;

        describe('When formating targets', () => {
            beforeEach(() => {
                targetsToGoals.mockClear();
                challengeVM.formatTargets(targets)
            });

            test('Then will call format goals with targets',
                () => {
                    expect(targetsToGoals).toBeCalledWith(targets);
                }
            );
        });
    });

    describe('Given no targets', () => {
        const targets = undefined;

        describe('When formating targets', () => {
            beforeEach(() => challengeVM.formatTargets(targets));

            test('Then does not call format goals',
                () => {
                    expect(targetsToGoals).toBeCalledTimes(0);
                }
            );
        });
    });
});

describe('getAllChallenges', () => {
    describe('When getting all challenges', () => {
        let promise;

        beforeEach(() => promise = challengeVM.getAllChallenges());

        test('Then firestore\'s get function will call once',
            done => {
                promise.then(() => {
                    expect(getFn).toBeCalledTimes(1);
                    done();
                })
                    .catch((error) => done(error));
            }
        );
    });
});

describe('getNearestChallenges', () => {
    describe('When getting nearest challenges', () => {
        let promise;

        beforeEach(() => promise = challengeVM.getNearestChallenges());

        test('Then firestore\'s get function will call once',
            done => {
                promise.then(() => {
                    expect(getFn).toBeCalledTimes(1);
                    done();
                })
                    .catch((error) => done(error));
            }
        );
    });
});

describe('getUpcomingChallenges', () => {
    describe('When getting upcoming challenges', () => {
        let promise;

        beforeEach(() => promise = challengeVM.getUpcomingChallenges(5));

        test('Then firestore\'s get function will call once',
            done => {
                promise.then(() => {
                    expect(getFn).toBeCalledTimes(1);
                    done();
                })
                    .catch((error) => done(error));
            }
        );
    });
});

describe('getDraftChallenges', () => {
    describe('When getting draft challenges', () => {
        let promise;

        beforeEach(() => promise = challengeVM.getDraftChallenges());

        test('Then firestore\'s get function will call once',
            done => {
                promise.then(() => {
                    expect(getFn).toBeCalledTimes(1);
                    done();
                })
                    .catch((error) => done(error));
            }
        );
    });
});

describe('formatChallengesInfo', () => {
    describe('Given challenges data', () => {
        const challenges = [FIRESTORE_CHALLENGE];

        describe('When formating challenges', () => {
            let result;

            beforeEach(() => result = challengeVM.formatChallengesInfo(challenges));

            test('Then unpacks data and keeps id',
                () => {
                    const expected_result = {
                        ...CHALLENGE_DATA,
                        id: AN_ID
                    };
                    expect(result[0]).toEqual(expected_result);
                }
            );
        });
    });

    describe('Given no challenges', () => {
        const challenges = [];

        describe('When formating challenges', () => {
            let result;

            beforeEach(() => result = challengeVM.formatChallengesInfo(challenges));

            test('Then return an empty array',
                () => {
                    expect(result.length).toBe(0);
                }
            );
        });
    });
});

describe('tableColunmDataList', () => {
    describe('Given a translation function', () => {
        describe('When making table columns', () => {
            let result;

            beforeEach(() => result = challengeVM.tableColumnDataList(translation));

            test('Then applies translation on each headers',
                () => {
                    expect(translation).toBeCalledTimes(result.length);
                }
            );
        });
    });
});

describe('tableColunmDataDraft', () => {
    describe('Given a translation function', () => {
        describe('When making table columns', () => {
            let result;

            beforeEach(() => result = challengeVM.tableColumnDataDraft(translation));

            test('Then applies translation on each headers',
                () => {
                    expect(translation).toBeCalledTimes(result.length);
                }
            );
        });
    });
});

describe('tableColunmDataUpcoming', () => {
    describe('Given a translation function', () => {
        describe('When making table columns', () => {
            let result;

            beforeEach(() => result = challengeVM.tableColumnDataUpcoming(translation));

            test('Then applies translation on each headers',
                () => {
                    expect(translation).toBeCalledTimes(result.length);
                }
            );
        });
    });
});

describe('tableColunmDataUsers', () => {
    describe('Given a translation function', () => {
        describe('When making table columns', () => {
            let result;

            beforeEach(() => result = challengeVM.tableColumnDataUsers(translation));

            test('Then applies translation on each headers',
                () => {
                    expect(translation).toBeCalledTimes(result.length);
                }
            );
        });
    });
});
