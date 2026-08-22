import { httpService } from './http.service.js'
import { utilService } from './util.service.js'

export const boardService = {
    query,
    getById,
    save,
    remove,
    getEmptyBoard,
    getEmptyGroup,
    getEmptyCard,
    getEmptyActivity,
    getEmptyComment,
    getEmptyTodo,
}

// ---------------------------
// BASIC CRUD - talks to the real backend (/api/board)
// ---------------------------
function query() {
    return httpService.get('board')
}

function getById(boardId) {
    return httpService.get(`board/${boardId}`)
}

function save(board) {
    if (board._id) return httpService.put(`board/${board._id}`, board)
    return httpService.post('board', board)
}

function remove(boardId) {
    return httpService.delete(`board/${boardId}`)
}

// ---------------------------
// EMPTY TEMPLATES
// (groups/cards/labels use "id", matching how the components read them,
// e.g. group-list.vue's `group.id` / `card.id`)
// ---------------------------
function getEmptyBoard() {
    return {
        title: '',
        isStarred: false,
        isTemplate: false,
        category: '',
        createdAt: Date.now(),
        lastTimeWatched: Date.now(),
        createdBy: null,
        background: '#0079BF',
        backgroundPhoto: '',
        backgroundThumb: '',
        labels: [
            { id: utilService.makeId(), title: '', color: '#61BD4F' },
            { id: utilService.makeId(), title: '', color: '#F2D600' },
            { id: utilService.makeId(), title: '', color: '#FF9F1A' },
            { id: utilService.makeId(), title: '', color: '#EB5A46' },
            { id: utilService.makeId(), title: '', color: '#C377E0' },
            { id: utilService.makeId(), title: '', color: '#0079BF' },
        ],
        members: [],
        groups: [],
        activities: [],
    }
}

function getEmptyGroup() {
    return {
        id: utilService.makeId(),
        title: '',
        cards: [],
        props: {
            orientation: 'vertical',
            className: 'card-container',
        },
    }
}

function getEmptyCard() {
    return {
        id: utilService.makeId(),
        isComplete: false,
        title: '',
        description: '',
        labels: [],
        createdAt: Date.now(),
        checklists: [],
        attachments: [],
        comments: [],
        cover: {},
        members: [],
        dueDate: '',
        isWatched: false,
        props: {
            className: 'card',
            style: {},
        },
    }
}

function getEmptyActivity() {
    return {
        id: utilService.makeId(),
        txt: '',
        createdAt: Date.now(),
        byMember: null,
        task: {},
    }
}

function getEmptyComment() {
    return {
        id: utilService.makeId(),
        txt: '',
        createdAt: Date.now(),
        byMember: null,
    }
}

function getEmptyTodo() {
    return {
        id: utilService.makeId(),
        text: '',
        isComplete: false,
    }
}
