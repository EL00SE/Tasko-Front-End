import {
    boardService
} from '../../services/board.service.js'
import {
    userService
} from '../../services/user.service.js'

export default {
    state: {
        boards: null,
        selectedBoard: null,
        filterBy: {
            txt: '',
        },
        loggedinUser: userService.getLoggedinUser()
    },
    getters: {
        boardsLoading(state) {
            return state.boards === null
        },
        board(state) {
            return state.selectedBoard
        },
        boards(state) {
            return state.boards
            // if (state.boards) {
            //     // state.loggedinUser = userService.getLoggedinUser()
            //     return state.boards.filter(board => board.members.some(member => member._id === state.loggedinUser._id) && !board.isTemplate)
            // }
        },
        starredBoards(state) {
            if (state.boards) {
                return state.boards.filter(board => board.isStarred && board.members.some(member => member._id === state.loggedinUser._id))
            }
        },
        recentlyBoards(state) {
            const recentlyBoards = JSON.parse(JSON.stringify(state.boards))
            let newBoards = recentlyBoards.filter(board => !board.isTemplate && board.members.some(member => member._id === state.loggedinUser?._id))
            return newBoards.sort((a, b) => b.lastTimeWatched - a.lastTimeWatched);
        },
        templates(state) {
            return state.boards.filter(board => board.isTemplate)
        },
        categoryBusiness(state) {
            return state.boards.filter(board => board.category === 'business' && board.isTemplate)
        },
        categoryDesign(state) {
            return state.boards.filter(board => board.category === 'design' && board.isTemplate)
        },
        categoryEducation(state) {
            return state.boards.filter(board => board.category === 'education' && board.isTemplate)
        },
        categoryLifestyle(state) {
            return state.boards.filter(board => board.category === 'lifestyle' && board.isTemplate)
        },
        allActivities(state) {
            var allActivities = []
            // state.selectedBoard.activities.forEach(activity => allActivities.unshift(activity))
            state.boards.forEach(board => board.activities.forEach(activity => allActivities.unshift(activity)))
            return allActivities
        },
        filteredBoards(state) {
            if (!state.filterBy.txt) return state.boards.filter(board => !board.isTemplate)
            if (state.filterBy.txt) {
                const regexTxt = new RegExp(state.filterBy.txt, 'i')
                return state.boards.filter(board =>
                    regexTxt.test(board.title) && !board.isTemplate)
            }
        },
        loggedinUserBoards(state) {
            return state.boards.filter(board => board.createdBy._id === state.loggedinUser._id)
        },
    },
    mutations: {
        setBoards(state, {
            boards
        }) {
            state.loggedinUser = userService.getLoggedinUser()
            state.boards = boards
        },
        setBoard(state, {
            board
        }) {
            state.selectedBoard = board;
        },
        removeBoard(state, {
            id
        }) {
            const idx = state.boards.findIndex((board) => board._id === id)
            state.boards.splice(idx, 1)
        },
        saveBoard(state, {
            board
        }) {
            const idx = state.boards.findIndex((currBoard) => currBoard._id === board._id)
            if (idx !== -1) state.boards.splice(idx, 1, board)
            else state.boards.push(board)
        },
        setFilter(state, {
            filterBy
        }) {
            state.filterBy = filterBy
        },
        updateUser(state) {
            state.loggedinUser = userService.getLoggedinUser()
        }
    },
    actions: {
        async loadBoards({
            commit,
            state
        }) {
            try {
                const boards = await boardService.query()
                commit({
                    type: 'setBoards',
                    boards: boards || []
                });
            } catch (err) {
                // Fall back to an empty list so the UI can stop showing a
                // loading state - without this, a genuine failure (as
                // opposed to just a slow cold-start response) would leave
                // the dashboard spinning forever instead of showing the
                // empty state.
                commit({ type: 'setBoards', boards: [] })
                console.log('err');
            }
        },
        async loadBoardById({
            commit
        }, {
            newId
        }) {
            try {
                const board = await boardService.getById(newId)
                commit({
                    type: 'setBoard',
                    board
                })
            } catch (err) {
                console.log('err!!');
            }
        },
        async removeBoard({
            commit
        }, {
            id
        }) {
            try {
                await boardService.remove(id)
                commit({
                    type: 'removeBoard',
                    id
                });
            } catch (err) {
                console.log('err!!');
            }
        },
        async saveBoard({
            commit
        }, {
            board
        }) {
            if (board.isTemplate) return
            try {
                if (board._id) commit({
                    type: 'setBoard',
                    board
                });
                const savedBoard = await boardService.save(board)
                commit({
                    type: 'saveBoard',
                    board: savedBoard
                });
                return savedBoard
            } catch (err) {
                console.log('sorry user cannot do that!!!');
            }
        },
        // filter({ commit, dispatch }, { filterBy }) {
        //     commit({ type: 'setFilter', filterBy });
        //     dispatch({
        //         type: 'loadBoards'
        //     });
        // },
    },
}