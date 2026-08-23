<template>
  <section>
    <section>
      <template-header
        v-if="board && board.isTemplate"
        :board="board"
        @duplicateTemplate="addTemplateBoard"
      ></template-header>

      <board-header
        v-if="board"
        :board="board"
        @titleChange="updateBoardTitle"
        @starredChange="isStarredBoard"
        @changeBgcColor="changeBoardBgcColor"
        @changeBoardBgc="changeBoardPhoto"
        @makeMember="inviteUser"
        @removeInvitedUser="removeMember"
      />
    </section>

    <section
      v-if="board"
      class="board-details-main"
      :style="{ backgroundColor: board.background }"
    >
      <group-list
        @saveCopy="saveCopyToBoard"
        @boardModified="updateBoard"
        @removeGroup="groupRemoveFromBoard"
        @openCardDetails="openCardDetailsModal"
        @groupUpdated="updateGroup"
        :groups="board.groups"
        :board="board"
        :newGroup="newGroup"
        @addGroup="addNewGroup"
        @groupDnd="updateBoardDnd"
      ></group-list>
    </section>

    <section v-if="!board" class="boards-home">
      <h2>Your boards</h2>
      <div v-if="boards.length" class="boards-home-grid">
        <div
          v-for="b in boards"
          :key="b._id"
          class="boards-home-card"
          :style="boardCardStyle(b)"
          @click="goToBoard(b)"
        >
          <span>{{ b.title }}</span>
        </div>
      </div>
      <p v-else class="boards-home-empty">
        You don't have any boards yet. Click <strong>Create</strong> above to make your first one.
      </p>
    </section>

    <section v-if="isCardOpen" class="dialog-container card-details-scroll">
      <card-details
        ref="cardDetailsModal"
        class="modal"
        @groupUpdate="updateGroup"
        @deleteCardFromGroup="deleteCardFromGroup"
        @boardModified="updateBoard"
        @cardModified="updateCard"
        @closeDialog="closeDiag"
        @saveCopy="saveCopyToBoard"
        :board="board"
        :card="cardToShow"
        :group="groupToShow"
      ></card-details>
    </section>
  </section>
</template>

<script>
import { boardService } from "../services/board.service.js"
import { socketService } from "../services/socket.service.js"
import { userService } from "../services/user.service.js"
import groupList from "../components/group-list.vue"
import boardHeader from "../components/board-header.vue"
import templateHeader from "../components/template-header.vue"
import cardDetails from "../components/card-details.vue"

export default {
  components: {
    groupList,
    boardHeader,
    cardDetails,
    templateHeader,
  },
  data() {
    return {
      isCardOpen: false,
      selectedCardIdx: null,
      selectedCardGroupIdx: null,
      boardToEdit: null,
      groupToEdit: null,
      newGroup: boardService.getEmptyGroup(),
      newActivity: boardService.getEmptyActivity(),
    }
  },
  created() {
    // This view only ever renders for the paramless /board route - any
    // board left over in the store from a previous /board/:boardId visit
    // is stale here and would otherwise make this look like the same
    // board instead of the boards dashboard.
    this.$store.commit({ type: "setBoard", board: null })
  },
  mounted() {
    socketService.on("board-changed", this.socketBoardUpdate)
  },
  methods: {
    socketBoardUpdate(board) {
      this.$store.commit({ type: "setBoard", board })
    },
    groupRemoveFromBoard(groupId) {
      this.boardToEdit = JSON.parse(JSON.stringify(this.board))
      this.newActivity = boardService.getEmptyActivity()
      if (this.loggedinUser) this.newActivity.byMember = this.loggedinUser
      const idx = this.boardToEdit.groups.findIndex((g) => g.id === groupId)
      this.saveActivity("removed list " + this.boardToEdit.groups[idx].title)
      this.boardToEdit.groups.splice(idx, 1)
      this.$store.dispatch({ type: "saveBoard", board: this.boardToEdit })
    },
    addNewGroup(newGroup) {
      if (!newGroup.title) return
      this.boardToEdit = JSON.parse(JSON.stringify(this.board))
      this.saveActivity("added " + newGroup.title + " to this board")
      this.boardToEdit.groups.push(newGroup)
      this.$store.dispatch({ type: "saveBoard", board: this.boardToEdit })
      this.newGroup = boardService.getEmptyGroup()
    },
    updateCard({ card, group }) {
      this.groupToEdit = JSON.parse(JSON.stringify(group))
      const idx = this.groupToEdit.cards.findIndex((c) => c.id === card.id)
      if (idx !== -1) this.groupToEdit.cards[idx] = card
      this.updateGroup(this.groupToEdit)
    },
    deleteCardFromGroup({ card, group }) {
      this.groupToEdit = JSON.parse(JSON.stringify(group))
      const idx = this.groupToEdit.cards.findIndex((c) => c.id === card.id)
      if (idx !== -1) this.groupToEdit.cards.splice(idx, 1)
      this.updateGroup(this.groupToEdit)
    },
    updateGroup(editedGroup) {
      this.boardToEdit = JSON.parse(JSON.stringify(this.board))
      const idx = this.boardToEdit.groups.findIndex((g) => g.id === editedGroup.id)
      if (idx !== -1) this.boardToEdit.groups.splice(idx, 1, editedGroup)
      this.$store.dispatch({ type: "saveBoard", board: this.boardToEdit })
    },
    updateBoard({ key, val }) {
      this.boardToEdit = JSON.parse(JSON.stringify(this.board))
      this.boardToEdit[key] = val
      this.$store.dispatch({ type: "saveBoard", board: this.boardToEdit })
    },
    openCardDetailsModal(info) {
      this.selectedCardGroupIdx = this.board.groups.findIndex((g) => g.id === info.group.id)
      if (this.selectedCardGroupIdx !== -1) {
        this.selectedCardIdx = this.board.groups[this.selectedCardGroupIdx].cards.findIndex(
          (c) => c.id === info.card.id
        )
        this.isCardOpen = true
      }
    },
    closeDiag() {
      this.isCardOpen = false
    },
    saveCopyToBoard(copy) {
      this.groupToEdit = JSON.parse(JSON.stringify(copy.posCopy.group))
      this.groupToEdit.cards.splice(copy.posCopy.position - 1, 0, copy.cardCopy)
      this.updateGroup(this.groupToEdit)
      socketService.emit("update board", copy)
    },
    updateBoardDnd(newBoard) {
      this.$store.dispatch({ type: "saveBoard", board: newBoard })
    },
    updateBoardTitle(title) {
      this.boardToEdit = JSON.parse(JSON.stringify(this.board))
      this.saveActivity("renamed this board from (" + this.board.title + ")")
      this.boardToEdit.title = title
      this.$store.dispatch({ type: "saveBoard", board: this.boardToEdit })
    },
    isStarredBoard(isStarred) {
      this.boardToEdit = JSON.parse(JSON.stringify(this.board))
      this.boardToEdit.isStarred = isStarred
      this.$store.dispatch({ type: "saveBoard", board: this.boardToEdit })
    },
    changeBoardBgcColor(color) {
      this.boardToEdit = JSON.parse(JSON.stringify(this.board))
      this.saveActivity("changed the background of this board")
      this.boardToEdit.background = color
      this.boardToEdit.backgroundPhoto = ""
      this.$store.dispatch({ type: "saveBoard", board: this.boardToEdit })
    },
    changeBoardPhoto(photo) {
      this.boardToEdit = JSON.parse(JSON.stringify(this.board))
      this.saveActivity("changed the background of this board")
      this.boardToEdit.background = ""
      this.boardToEdit.backgroundPhoto = photo.full
      this.boardToEdit.backgroundThumb = photo.thumb
      this.$store.dispatch({ type: "saveBoard", board: this.boardToEdit })
    },
    saveActivity(txt) {
      if (!this.boardToEdit) return
      if (this.loggedinUser) this.newActivity.byMember = this.loggedinUser
      this.newActivity.txt = txt
      this.boardToEdit.activities.unshift(this.newActivity)
      this.newActivity = boardService.getEmptyActivity()
    },
    inviteUser(user) {
      this.boardToEdit = JSON.parse(JSON.stringify(this.board))
      this.boardToEdit.members.push(user)
      this.saveActivity("added " + user.fullname + " to this board")
      this.$store.dispatch({ type: "saveBoard", board: this.boardToEdit })
    },
    removeMember(user) {
      this.boardToEdit = JSON.parse(JSON.stringify(this.board))
      const idx = this.boardToEdit.members.findIndex((m) => m._id === user._id)
      if (idx !== -1) this.boardToEdit.members.splice(idx, 1)
      this.saveActivity("removed " + user.fullname + " from this board")
      this.$store.dispatch({ type: "saveBoard", board: this.boardToEdit })
    },
    addTemplateBoard(board) {
      if (this.loggedinUser) {
        board.createdBy = this.loggedinUser
        board.members.push(this.loggedinUser)
        this.newActivity.byMember = this.loggedinUser
      }
      board.isTemplate = false
      this.newActivity.txt = "created this board"
      board.activities.push(this.newActivity)
      this.newActivity = boardService.getEmptyActivity()
      this.$store.dispatch({ type: "saveBoard", board })
    },
    goToBoard(board) {
      this.$router.push(`/board/${board._id}`)
    },
    boardCardStyle(board) {
      return board.backgroundPhoto
        ? { backgroundImage: `url(${board.backgroundPhoto})` }
        : { backgroundColor: board.background || "#0079BF" }
    },
  },
  computed: {
    board() {
      return this.$store.getters.board
    },
    boards() {
      return this.$store.getters.boards || []
    },
    cardToShow() {
      if (!this.board || this.selectedCardGroupIdx === null || this.selectedCardIdx === null) return null
      return this.board.groups[this.selectedCardGroupIdx].cards[this.selectedCardIdx]
    },
    groupToShow() {
      if (!this.board || this.selectedCardGroupIdx === null) return null
      return this.board.groups[this.selectedCardGroupIdx]
    },
    loggedinUser() {
      return this.$store.getters.loggedinUser
    },
  },
  watch: {
    "$route.params.boardId": {
      async handler(newId) {
        if (newId) {
          await this.$store.dispatch({ type: "loadBoardById", newId })
          if (this.loggedinUser) {
            socketService.emit("watch board", newId)
            socketService.emit("set-user-socket", this.loggedinUser._id)
          }
        }
      },
      immediate: true,
    },
  },
}
</script>

<style scoped>
.board-details-main {
  padding: 16px;
  display: flex;
  flex-direction: column;
}
.boards-home {
  padding: 24px;
}
.boards-home h2 {
  margin-bottom: 16px;
  font-size: 16px;
}
.boards-home-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}
.boards-home-card {
  height: 90px;
  border-radius: 6px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
  padding: 10px;
  cursor: pointer;
  color: #fff;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}
.boards-home-empty {
  color: #6b7785;
}
.dialog-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.4);
}
.card-details-scroll {
  overflow-y: auto;
}
</style>
