<template>
    <section @click.stop.prevent="openDetails">
        <section
            ref="card-modal"
            class="card-preview cursor-pointer flex"
            :style="(group.cards.findIndex(cardToFind => cardToFind.id === card.id) === group.length - 1) ? { marginBottom: 0 + 'px' } : {}"
        >
            <section v-if="card.cover.type === 'color' && card.cover.size === 'large'">
                <div
                    class="card-cover-color-large cursor-pointer"
                    v-bind:style="{ backgroundColor: card.cover.value }"
                >
                    <div class="card-title">
                        <span
                            :style="(card.cover.value === '#172B4D') ? { color: '#FFFFFF' } : { color: '#172B4D' }"
                        >{{ card.title }}</span>
                    </div>
                </div>
            </section>
            <section v-if="card.cover.type === 'attachment' && card.cover.size === 'large'">
                <div
                    class="card-cover-attachment-large cursor-pointer"
                    v-bind:style="{ backgroundImage: 'url(' + card.cover.value + ')' }"
                >
                    <img :src="card.cover.value" style="visibility:hidden" />
                    <div
                        :class="{ coverlight: card.cover.theme === 'light', coverdark: card.cover.theme === 'dark' }"
                    ></div>
                    <div
                        class="card-title"
                        :class="{ covertitlelight: card.cover.theme === 'light', covertitledark: card.cover.theme === 'dark' }"
                    >
                        <span>{{ card.title }}</span>
                    </div>
                </div>
            </section>
            <section v-if="card.cover.type === 'color' && card.cover.size === 'small'">
                <div
                    class="card-cover-color-small"
                    v-bind:style="{ backgroundColor: card.cover.value }"
                ></div>
            </section>
            <section v-if="card.cover.type === 'attachment' && card.cover.size === 'small'">
                <div
                    class="card-cover-attachment-small"
                    v-bind:style="{ backgroundImage: 'url(' + card.cover.value + ')' }"
                >
                    <img :src="card.cover.value" style="visibility:hidden" />
                </div>
            </section>
            <button class="icon-sm icon-edit" @click.stop.prevent="openMiniEdit($event)"></button>
            <section v-if="card.cover.size !== 'large'" class="card-preview-main">
                <div v-if="card.labels.length && board.labels.length" class="labels">
                    <div
                        v-for="label in card.labels"
                        :key="label"
                        class="label"
                        :class="openLabels"
                        @mouseover="darkenLabels"
                        @mouseleave="lightenLabels"
                        @click.stop.prevent="openAllLabels"
                        :style="(isLabelDark) ? { backgroundColor: lightenDarkenColor(board.labels[board.labels.findIndex(labelToFind => labelToFind.id === label)].color) } : { backgroundColor: board.labels[board.labels.findIndex(labelToFind => labelToFind.id === label)].color }"
                    >{{ board.labels[board.labels.findIndex(labelToFind => labelToFind.id === label)].title }}</div>
                </div>
                <div>
                    <p class="card-title cursor-pointer">{{ card.title }}</p>
                </div>
                <div class="card-bar">
                    <div class="card-bar-icon">
                        <div
                            v-if="card.date"
                            class="date"
                            @click.stop.prevent="onDateClicked"
                            :class="updateDateStyle"
                        >
                            <span class="icon-sm icon-clock-in-date"></span>
                            <!-- <span class="date-txt">{{ setDateFormat(card.date) }}</span> -->
                            <span class="date-txt">{{ setDateFormat }}</span>
                        </div>
                    </div>
                    <div v-if="card.attachments.length" class="attachments">
                        <span class="icon-sm icon-attachment-pre"></span>
                        <span class="attachments-length">{{ card.attachments.length }}</span>
                    </div>
                    <div v-if="card.description" class="description">
                        <span class="icon-sm icon-description"></span>
                    </div>
                    <div v-if="card.comments.length" class="comments">
                        <span class="icon-sm icon-comments-pre"></span>
                        <span class="length">{{ card.comments.length }}</span>
                    </div>
                    <div v-if="card.checklists.length" class="checklists">
                        <span class="icon-sm icon-checklists-pre"></span>
                        <span class="nums">{{ setChecklistPreview(card.checklists) }}</span>
                    </div>
                    <div class="card-bar-members">
                        <div v-if="card.members.length && board.members.length" class="members">
                            <div
                                class="member-in-card"
                                v-for="member in card.members"
                                :key="member._id"
                            >
                                <img
                                    class="member-avatar"
                                    v-if="member.imgUrl"
                                    :src="member.imgUrl"
                                    alt
                                />
                                <div v-else class="member">{{ setMemberLetters(member.fullname) }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </section>
    </section>
</template>
<script>
import { boardService } from "../services/board.service.js";
import { applyDrag, generateItems } from '../services/dnd.service.js';
import labelModal from "./label-modal-cmp.vue";
import membersModal from "./memebers-modal-cmp.vue";
import datesModal from "./date-modal-cmp.vue";
import deleteWarning from "./delete-warning-modal-cmp.vue";
import coverModal from "./cover-modal-cmp.vue";
import copyModal from "./copy-modal-cmp.vue";
import moment from 'moment'
// import { json } from "stream/consumers";
// import { throws } from "assert";
export default {
    name: 'card-preview',
    props: {
        board: {
            type: Object
        },
        group: {
            type: Object
        },
        card: {
            type: Object,
            required: true,
        },
        isLabelOpen: {
            type: Boolean,
        },
    },
    components: {
        labelModal,
        membersModal,
        datesModal,
        moment,
        coverModal,
        deleteWarning,
        copyModal
        // throws
    },
    data() {
        return {
            currModal: null,
            isModalShown: false,
            pos: 0,
            posOfEditor: 0,
            isLabelDark: false,
            modalOpen: false,
            titleIsOpen: false,
            warningOpen: false,
            warningTitle: '',
            groupToEdit: {},
            cardToDisplay: JSON.parse(JSON.stringify(this.card)),
            cardToEdit: {
                title: "",
            },
            isActionsOpen: false,
            activeComponent: null,
            isLabelClicked: false,
            timeCalc: null,
        }
    },
    created() {
    },
    methods: {
        setChecklistPreview(cardChecklists) {
            var checklists = JSON.parse(JSON.stringify(cardChecklists))
            var allTodosSum = 0
            var completedTodos = []
            checklists.forEach(checklist => allTodosSum += checklist.todos.length)
            checklists.forEach(checklist => checklist.todos.forEach(todo => completedTodos.push(todo)))
            completedTodos = completedTodos.filter(todo => todo.isComplete)
            return completedTodos.length + '/' + allTodosSum
        },
        openThisModal(modalName, ref) {
            if (this.isModalShown === true && modalName === this.currModal) this.isModalShown = false
            else {
                const positionOfBtn = this.$refs[ref].getBoundingClientRect()
                this.posOfEditor = JSON.parse(JSON.stringify(positionOfBtn))
                this.posOfEditor.left -= 5
                this.posOfEditor.bottom -= 4
                this.isModalShown = true
                this.currModal = modalName
            }
        },
        openTitleEdit() {
            // this.titleIsOpen = true;
        },
        editBoard(editedAttribute) {
            this.$emit('boardUpdated', editedAttribute)
        },
        CopyNewCard(copy) {
            this.$emit('copyCardToGroup', copy)
            this.closeModal()
        },
        changeTitle(title) {
            this.cardToEdit = JSON.parse(JSON.stringify(this.card))
            this.cardToEdit.title = title
            this.$emit('editCard', { card: this.cardToEdit, group: this.group })
            this.titleIsOpen = false;
        },
        calcPosOfModal() {
            this.pos = this.$refs['card-modal'].getBoundingClientRect()
        },
        openMiniEdit() {
            this.pos = this.$refs['card-modal'].getBoundingClientRect()
            this.cardToDisplay = JSON.parse(JSON.stringify(this.card))
            this.$emit('toggleQuickEdit', { card: this.cardToDisplay, group: this.group, pos: this.pos })
        },
        openDetails() {
            this.modalOpen = false;
            this.isModalShown = false
            // this.$emit('toggleQuickEdit')
            this.$emit('openCard', { card: this.card, group: this.group })
        },
        openAllLabels() {
            this.isLabelClicked = !this.isLabelClicked
            this.$emit('openAllLabels', this.isLabelClicked)
        },
        closeModal() {
            this.modalOpen = false
            this.isModalShown = false
            this.$emit('toggleQuickEdit')
        },
        deleteWarn() {
            this.posOfEditor = this.$refs['deleteBtn'].getBoundingClientRect()
            this.warningTitle = 'card'
            this.warningOpen = true
        },
        closeWarning() {
            this.warningOpen = false
        },
        deleteCard() {
            this.groupToEdit = JSON.parse(JSON.stringify(this.group))
            const cardIdx = this.groupToEdit.cards.findIndex(cardToFind => cardToFind.id === this.card.id)
            this.groupToEdit.cards.splice(cardIdx, 1)
            this.$emit('deleteCard', this.groupToEdit)
            this.modalOpen = false;
        },
        showEditedCard(card) {
            this.cardToDisplay = card
        },
        saveCard() {
            this.$emit('editCard', { card: this.cardToDisplay, group: this.group })
            this.isModalShown = false
            this.closeModal()
        },
        setMemberLetters(fullname) {
            const firstLetters = fullname
                .split(' ')
                .map(word => word[0])
                .join('');
            return firstLetters.toUpperCase()
        },
        closeMenu() {
            this.isModalShown = false
        },
        onDateClicked() {
            this.cardToEdit = JSON.parse(JSON.stringify(this.card))
            this.cardToEdit.isComplete = !this.cardToEdit.isComplete
            this.$emit('editCard', { card: this.cardToEdit, group: this.group })
        },
        darkenLabels() {
            this.isLabelDark = true
        },
        lightenLabels() {
            this.isLabelDark = false
        },
        lightenDarkenColor(colorCode) {
            if (colorCode === '#61BD4F') return '#519839'
            if (colorCode === '#F2D600') return '#d9b51c'
            if (colorCode === '#FF9F1A') return '#cd8313'
            if (colorCode === '#EB5A46') return '#b04632'
            if (colorCode === '#C377E0') return '#89609e'
            if (colorCode === '#0079BF') return '#055a8c'
            if (colorCode === '#00C2E0') return '#0098b7'
            if (colorCode === '#51E898') return '#4bbf6b'
            if (colorCode === '#FF78CB') return '#c9558f'
            if (colorCode === '#344563') return '#091e42'
        },
    },
    computed: {
        openLabels() {
            return { labelOpen: this.isLabelOpen };
        },
        setDateFormat() {
            const timeCalc = (Date.now() - this.card.date)
            this.timeCalc = timeCalc
            const dt = new Date(this.card.date)
            const date = Intl.DateTimeFormat('en-Us', { month: 'short', day: 'numeric' }).format(dt)
            return date
        },
        updateDateStyle() {
            return { dateUncompleted: !this.cardToDisplay.isComplete, dateCompleted: this.cardToDisplay.isComplete, datePast: this.timeCalc > 0 };
        },
    },
    emits: ['copyCardToGroup', 'openCard', 'editCard', 'openAllLabels', 'deleteCard', 'boardUpdated', 'toggleQuickEdit'],
}
</script>













