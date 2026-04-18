//export const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F']
export const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

export const ADVANCEMENT_RULES = {
  groupWinner: 1,
  groupRunnerUp: 1,
  bestThirdPlaced: 4
};

export const POINT_RULES = {
    single: {
        H: 8,
        U: 9,
        B: 8
    },
    singleDouble: {
        H: 16,
        U: 18,
        B: 16
    },
    half: {
        points: 4,
        double: 8
    },
    full: {
        points: 1,
        double: 2
    },
    penalty: {
        singleAdjacent: 0,
        singleTwoSteps: -2,
        double: -16
    },
    bonus: {
        single: 6,
        half: 3
    }
};