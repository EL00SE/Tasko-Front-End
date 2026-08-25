<template>
    <section class="toggle-input">
        <p v-if="!titleIsOpen" class="group-title cursor-pointer" @click.stop.prevent="openTitleEdit">{{ txt }}</p>
        <input
            v-focus
            v-clickOutside="change"
            v-if="titleIsOpen"
            v-model="txt"
            type="text"
            @submit.prevent="change"
        />
        <span
            @click.stop.prevent="calcPosOfBox(), openEditGroupModal()"
            ref="box"
            class="icon-sm icon-overflow-menu-horizontal"
        ></span>
        <group-edit
            v-if="openGroupEdit"
            :style="{ top: '138' + 'px', left: pos.left + 'px' }"
            v-clickOutside="closeEditMode"
            @close="closeEditMode"
            :id="id"
            @remove="removeGroup"
        ></group-edit>
    </section>
</template>

<script>
import groupEdit from "./group-edit.vue"
export default {
    name: "toggle-input",
    props: {
        id: {
            type: String
        },
        title: {
            type: String
        }
    },
    data() {
        return {
            txt: "",
            titleIsOpen: false,
            openGroupEdit: false,
            pos: 0,
            boardToEdit: null,
        }
    },
    created() {
        this.txt = this.title
    },
    methods: {
        openTitleEdit() {
            this.titleIsOpen = true
        },
        change() {
            if (!this.txt) return
            this.titleIsOpen = false;
            this.$emit('titleChange', { txt: this.txt, id: this.id })
        },
        openEditGroupModal() {
            this.openGroupEdit = true
        },
        closeEditMode() {
            this.openGroupEdit = false;
        },
        removeGroup(groupId) {
            this.$emit('groupDelete', groupId)
            this.closeEditMode()
        },
        calcPosOfBox() {
            this.pos = this.$refs['box'].getBoundingClientRect()
        }
    },
    components: {
        groupEdit,
    },
    emits: ['titleChange','groupDelete']

}
</script>

<style>
</style>
