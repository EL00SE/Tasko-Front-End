<!-- card preview inside group list -->
<template >
    <section>
        <Container
            class="group-list-main scroll-groups"
            orientation="horizontal"
            @drop="onGroupDrop($event)"
            drag-handle-selector=".group-preview-main"
        >
            <!-- group -->
            <Draggable
                v-for="group in board.groups"
                :key="group"
                class="group-preview-main cursor-pointer"
                drag-class="tilt"
            >
                    <div>
                <div class="group-preview">
                        <!-- title -->
                        <toggle-input-cmp
                            class="title"
                            @groupDelete="deleteGroup"
                            @titleChange="changeTitle"
                            :title="group.title"
                            :id="group.id"
                        ></toggle-input-cmp>
                        <!-- card-list -->

                        <Container
                            class="scroller-group"
                            drag-class="tilt"
                            group-name="col"
                            orientation="vertical"
                            :get-child-payload="getCardPayload(group.id)"
                            @drop="(e) => onCardDrop(group.id, e)"
                        >
                            <Draggable v-for="card in group.cards" :key="card.id">
                                <card-preview
                                    @copyCardToGroup="CopyNewCard"
                                    @toggleQuickEdit="openMiniEdit"
                                    @boardUpdated="modifyBoard"
                                    @deleteCard="cardDelete"
                                    @editCard="modCard"
                                    @openCard="openCardModalFromPreview"
                                    @openAllLabels="onOpenAllLabels"
                                    :group="group"
                                    :card="card"
                                    :board="board"
                                    :isLabelOpen="isLabelOpen"
                                ></card-preview>
                            </Draggable>
                            <div
                                v-if="isAddingCard && groupToEdit.id === group.id"
                                v-clickOutside="saveNewCardAndClose"
                                class="add-new-card-input"
                            >
                                <div class="txt-box">
                                    <textarea
                                        v-focus
                                        @keydown.enter.stop.prevent="saveNewCard(group)"
                                        placeholder="Enter a title for this card..."
                                        type="text"
                                        v-model="newCard.title"
                                    />
                                </div>
                            </div>
                            <!-- add-card-btn -->
                        </Container>
                    <section class="add-card-cmp">
                        <button
                            class="btn-add-card-out"
                            v-if="!isAddingCard||groupToEdit.id !== group.id"
                            @click.stop.prevent="openCardAdder(group)"
                        >
                            <span class="icon-sm icon-add-gray"></span>
                            <p>Add a card</p>
                        </button>

                        <div v-if="isAddingCard&&groupToEdit.id === group.id" class="btn-card-add">
                            <button type="button" class="btn-add-card-in" @click.stop.prevent="saveNewCardAndClose">Add card</button>
                            <span type="button" class="icon-lg icon-close-close" @click.stop.prevent="closeAdder"></span>
                        </div>
                    </section>
                    </div>
                </div>
            </Draggable>
            <!-- end -->

            <div class="add-new-group" :style="show ? { 'height': '100px' } : null">
                <button class="add-another-list-btn" v-if="!show" @click="show = true">
                    <span class="icon-sm icon-add-light"></span>Add another list
                </button>
                <div v-clickOutside="close" v-if="show" class="add-new-group-in">
                    <textarea
                        @keyup.enter="addNewGroup"
                        placeholder="Enter list title..."
                        type="text"
                        v-model="newGroup.title"
                    />
                    <div class="controls-add-list">
                        <button class="btn-add-card-in" @click="addNewGroup">Add List</button>
                        <span class="icon-lg icon-close-close" @click="show = false"></span>
                    </div>
                </div>
            </div>
        </Container>

        <section
            @click.stop.prevent="closeModal"
            class="mini-edit-modal-main flex"
            v-if="modalOpen"
        >
            <span class="icon-xl icon-close-in-pencil-modal" @click.stop.prevent="closeModal"></span>
            <section
                @click.prevent.stop
                class="mini-edit-modal-second"
                style="position:fixed;"
                :style="{ top: pos.top + 'px', left: pos.left + 'px' }"
            >
                <section class="modal-edit" @click.prevent.stop>
                    <div class="modal-card" @click.prevent.stop>
                        <div
                            v-if="cardToDisplay.cover.type === 'color'"
                            class="mini-edit-cover-color"
                            :style="{ backgroundColor: cardToDisplay.cover.value }"
                        ></div>
                        <div
                            v-if="cardToDisplay.cover.type === 'attachment'"
                            class="mini-edit-cover-attach"
                            :style="{ backgroundImage: 'url(' + cardToDisplay.cover.value + ')' }"
                        >
                            <img :src="cardToDisplay.cover.value" style="visibility:hidden" />
                        </div>
                        <div class="modal-card-main">
                            <div
                                v-if="cardToDisplay.labels.length && cardToDisplay.labels.length"
                                class="labels"
                            >
                                <div
                                    class="label"
                                    v-for="label in cardToDisplay.labels"
                                    :key="label"
                                    :style="{ 'backgroundColor': board.labels[board.labels.findIndex(labelToFind => labelToFind.id === label)].color }"
                                >{{ board.labels[board.labels.findIndex(labelToFind => labelToFind.id === label)].title }}</div>
                            </div>
                            <div>
                                <textarea
                                    
                                    name="mini-edit-ta"
                                    style="resize:none"
                                    v-model="cardToDisplay.title"
                                ></textarea>
                            </div>
                            <div class="card-bar">
                                <div class="card-bar-icon">
                                    <div
                                        v-if="cardToDisplay.date"
                                        class="date"
                                        @click.stop.prevent="onDateClicked"
                                        :class="updateDateStyle"
                                    >
                                        <span class="icon-sm icon-clock-in-date"></span>
                                        <span class="date-txt">{{ setDateFormat }}</span>
                                    </div>
                                </div>
                                <div v-if="cardToDisplay.attachments.length" class="attachments">
                                    <span class="icon-sm icon-attachment-pre"></span>
                                    <span
                                        class="attachments-length"
                                    >{{ cardToDisplay.attachments.length }}</span>
                                </div>
                                <div v-if="cardToDisplay.description" class="description">
                                    <span class="icon-sm icon-description"></span>
                                </div>
                                <div v-if="cardToDisplay.comments.length" class="comments">
                                    <span class="icon-sm icon-comments-pre"></span>
                                    <span class="length">{{ cardToDisplay.comments.length }}</span>
                                </div>
                                <!-- ///////////////////////////////////////////////////////////////////////////////////////////////// -->
                                <div v-if="cardToDisplay.checklists.length" class="checklists">
                                    <span class="icon-sm icon-checklists-pre"></span>
                                    <span
                                        class="nums"
                                    >{{ setChecklistPreview(cardToDisplay.checklists) }}</span>
                                </div>
                                <div class="card-bar-members">
                                    <div
                                        v-if="cardToDisplay.members.length && board.members.length"
                                        class="members"
                                    >
                                        <div
                                            class="member"
                                            v-for="member in cardToDisplay.members"
                                            :key="member._id"
                                        >{{ setMemberLetters(member.fullname) }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <button class="mini-edit-save" @click.stop.prevent="saveCard">Save</button>
                    </div>
                </section>
                <section class="modal-actions-btns" @click.prevent.stop>
                    <button @click.stop.prevent="openCardModal">
                        <span class="icon-sm icon-card-pen"></span>
                        <p>Open card</p>
                    </button>
                    <button
                        type="button"
                        ref="labelBtn"
                        @click.stop.prevent="openThisModal('labelModal', 'labelBtn')"
                    >
                        <span class="icon-sm icon-label-pen"></span>
                        <p>Edit labels</p>
                    </button>
                    <button
                        type="button"
                        ref="membersBtn"
                        @click.stop.prevent="openThisModal('membersModal', 'membersBtn')"
                    >
                        <span class="icon-sm icon-member-pen"></span>
                        <p>Change members</p>
                    </button>
                    <button
                        type="button"
                        ref="coverBtn"
                        @click.stop.prevent="openThisModal('coverModal', 'coverBtn')"
                    >
                        <span class="icon-sm icon-card-cover-pen"></span>
                        <p>Change cover</p>
                    </button>
                    <button
                        type="button"
                        ref="copyBtn"
                        @click.stop.prevent="openThisModal('copyModal', 'copyBtn')"
                    >
                        <span class="icon-sm icon-card-copy-pen"></span>
                        <p>Copy</p>
                    </button>
                    <button
                        ref="datesBtn"
                        @click.stop.prevent="openThisModal('datesModal', 'datesBtn')"
                    >
                        <span class="icon-sm icon-clock-pen"></span>
                        <p>Edit dates</p>
                    </button>
                    <button ref="deleteBtn" @click.stop.prevent="deleteWarn">
                        <span class="icon-sm icon-delete-pen"></span>
                        <p>Delete</p>
                    </button>
                </section>
            </section>
            <delete-warning
                @click.prevent.stop
                @closeDeleteWarning="closeWarning"
                @deleteConfirmed="deleteCard"
                v-if="warningOpen"
                :title="warningTitle"
                :pos="posOfEditor"
            ></delete-warning>
            <section v-if="isModalShown">
                <component
                    @click.prevent.stop
                    @cardCopySave="CopyNewCard"
                    @boardEdit="modifyBoard"
                    @cardEdit="showEditedCard"
                    @actionsClose="closeMenu"
                    :board="board"
                    :card="cardToDisplay"
                    :group="groupToEdit"
                    :pos="posOfEditor"
                    :is="currModal"
                ></component>
            </section>
        </section>
    </section>
</template>

<script>
import cardPreview from "./card-preview.vue";
import toggleInputCmp from "./toggle-input-cmp.vue";
import labelModal from "./label-modal-cmp.vue";
import membersModal from "./memebers-modal-cmp.vue";
import datesModal from "./date-modal-cmp.vue";
import deleteWarning from "./delete-warning-modal-cmp.vue";
import coverModal from "./cover-modal-cmp.vue";
import copyModal from "./copy-modal-cmp.vue";
import { uploadService } from "../services/upload.service.js"
import { Container, Draggable } from "vue3-smooth-dnd";
import { applyDrag, generateItems } from '../services/dnd.service.js'
import { boardService } from '../services/board.service.js';

export default {
    name: "group-list",
    components: {
        cardPreview,
        toggleInputCmp,
        Container,
        Draggable,
        labelModal,
        membersModal,
        datesModal,
        coverModal,
        deleteWarning,
        copyModal
    },
    props: {
        groups: {
            type: Array
        },
        newGroup: {
            type: Object
        },
        board: {
            type: Object,
            required: true
        },
    },
    data() {
        return {
            show: false,
            groupToDisplay: {
                title: ""
            },
            groupToEdit: null,
            titleIsOpen: false,
            isLabelOpen: false,
            isQuickEditOpen: false,
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
            cardToDisplay: {},
            cardToEdit: {
                title: "",
            },
            timeCalc: null,
            newCard: {},
            isAddingCard: false
        };
    },
    created() {
    },
    computed: {
        boardToEdit() {
            return JSON.parse(JSON.stringify(this.board))
        },
        pointerEvents() {
            return this.isQuickEditOpen
        },
        setDateFormat() {
            const timeCalc = (Date.now() - this.cardToDisplay.date)
            this.timeCalc = timeCalc
            const dt = new Date(this.cardToDisplay.date)
            const date = Intl.DateTimeFormat('en-Us', { month: 'short', day: 'numeric' }).format(dt)
            return date
        },
        updateDateStyle() {
            return { dateUncompleted: !this.cardToDisplay.isComplete, dateCompleted: this.cardToDisplay.isComplete, datePast: this.timeCalc > 0 };
        },
    },
    methods: {
        openCardAdder(group) {
            if (!this.newCard.id) this.newCard = boardService.getEmptyCard()
            this.groupToEdit = JSON.parse(JSON.stringify(group))
            this.isAddingCard = true
        },
        saveNewCard(group) {
            if (this.newCard.title === '') return
            this.groupToEdit = JSON.parse(JSON.stringify(group))
            this.groupToEdit.cards.push(this.newCard)
            this.$emit('groupUpdated', this.groupToEdit)
            this.newCard = boardService.getEmptyCard()
        },
        saveNewCardAndClose() {
            if (this.newCard.title === '') {
                this.isAddingCard = false
                return
            }
            this.groupToEdit.cards.push(this.newCard)
            this.$emit('groupUpdated', this.groupToEdit)
            this.newCard = boardService.getEmptyCard()
            this.isAddingCard = false
        },
        closeAddACard() {
            this.isAddingCard = false
        },
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
        CopyNewCard(copy) {
            this.$emit('saveCopy', copy)
            this.closeModal()
        },
        calcPosOfModal() {
            this.pos = this.$refs['card-modal'].getBoundingClientRect()
        },
        openMiniEdit({ card, group, pos }) {
            this.cardToDisplay = card
            this.groupToEdit = group
            this.pos = pos
            this.modalOpen = true;
        },
        closeModal() {
            this.modalOpen = false
            this.isModalShown = false
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
            this.groupToEdit = JSON.parse(JSON.stringify(this.groupToEdit))
            const cardIdx = this.groupToEdit.cards.findIndex(cardToFind => cardToFind.id === this.cardToDisplay.id)
            this.groupToEdit.cards.splice(cardIdx, 1)
            this.$emit('groupUpdated', this.groupToEdit)
            this.warningOpen = false
            this.modalOpen = false;
        },
        showEditedCard(card) {
            this.cardToDisplay = card
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
        modCard({ card, group }) {
            this.groupToEdit = JSON.parse(JSON.stringify(group))
            const idx = this.groupToEdit.cards.findIndex(cardToFind => cardToFind.id === card.id)
            this.groupToEdit.cards[idx] = card
            this.$emit('groupUpdated', this.groupToEdit)
        },
        changeTitle({ txt, id }) {
            this.groupToEdit = JSON.parse(JSON.stringify(this.groups.find(group => group.id === id)))
            this.groupToEdit.title = txt
            this.$emit('groupUpdated', this.groupToEdit)
            this.groupToEdit = null
            this.titleIsOpen = false;
        },
        modifyBoard(adjustmentOfBoard) {
            this.$emit('boardModified', adjustmentOfBoard)
        },
        addNewCard({ newCard, group }) {
            this.groupToEdit = JSON.parse(JSON.stringify(this.groups.find(groupToCheck => groupToCheck.id === group.id)))
            this.groupToEdit.cards.push(newCard)
            this.$emit('groupUpdated', this.groupToEdit)
            // this.$emit('activitySave', 'added ' + newCard.title + ' to ' + group.title)
            this.groupToEdit = null
        },
        cardDelete(updatedGroup) {
            this.$emit('groupUpdated', updatedGroup)
        },
        openCardModal() {
            this.isQuickEditOpen = false
            this.modalOpen = false;
            this.isModalShown = false
            this.$emit('openCardDetails', { card: this.cardToDisplay, group: this.groupToEdit })
        },
        openCardModalFromPreview({ card, group }) {
            this.isQuickEditOpen = false
            this.modalOpen = false;
            this.isModalShown = false
            this.$emit('openCardDetails', { card, group })
        },
        onOpenAllLabels(isLabelClicked) {
            this.isLabelOpen = isLabelClicked
        },
        saveCard() {
            const cardIdx = this.groupToEdit.cards.findIndex(cardToFind => cardToFind.id === this.cardToDisplay.id)
            this.groupToEdit = JSON.parse(JSON.stringify(this.groupToEdit))
            this.groupToEdit.cards.splice(cardIdx, 1, this.cardToDisplay)
            this.$emit('groupUpdated', this.groupToEdit)
            this.isModalShown = false
            this.closeModal()
        },
        deleteGroup(groupId) {
            this.$emit('removeGroup', groupId)
        },
        close() {
            this.show = false;
            this.newGroup.title = ""
        },
        addNewGroup() {
            this.$emit('addGroup', this.newGroup)
        },
        onGroupDrop(dropResult) {
            this.boardToEdit.groups = applyDrag(this.boardToEdit.groups, dropResult)
            this.$emit('groupDnd', this.boardToEdit)
        },
        onCardDrop(groupId, dropResult) {
            if (dropResult.removedIndex !== null || dropResult.addedIndex !== null) {
                const newGroup = this.boardToEdit.groups.filter(p => p.id === groupId)[0]
                const groupIndex = this.boardToEdit.groups.indexOf(newGroup)
                const newColumn = JSON.parse(JSON.stringify(newGroup))
                newColumn.cards = applyDrag(newColumn.cards, dropResult)
                this.boardToEdit.groups.splice(groupIndex, 1, newColumn)
                this.$emit('groupDnd', this.boardToEdit)
            }
        },
        getCardPayload(groupId) {
            return index => {
                return this.boardToEdit.groups.filter(p => p.id === groupId)[0].cards[index]
            }
        },
        closeAdder(){
            this.isAddingCard = false
        }
    },
    emits: ['boardUpdated', 'saveCopy', 'activitySave', 'openCardDetails', 'removeGroup', 'groupUpdated', 'addGroup', 'groupDnd', 'boardModified']
}
</script>

<style>
</style>