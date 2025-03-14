<template>
  <div class="editor">
    <editor-menu-bar
      class="mb-5"
      :editor="editor"
    >
      <div>
        <v-btn
          v-for="(item, i) in editItems"
          :key="i"
          class="mr-1"
          depressed
          small
          :color="item.activate ? 'primary' : ''"
          @click="item.action"
        >
          <v-icon> {{ item.icon }} </v-icon>
        </v-btn>
      </div>
    </editor-menu-bar>
    <div
      style="{
        cursor: text;
      }"
      @click="editor.focus()"
    >
      <editor-content
        class="editor__content"
        :editor="editor"
      />
    </div>
  </div>
</template>

<script>
  import { Editor, EditorContent, EditorMenuBar } from 'tiptap'
  import {
    Placeholder,
    Blockquote,
    CodeBlock,
    HardBreak,
    Heading,
    HorizontalRule,
    OrderedList,
    BulletList,
    ListItem,
    TodoItem,
    TodoList,
    Bold,
    Code,
    Italic,
    Link,
    Strike,
    Underline,
    History,
    Image,
  } from 'tiptap-extensions'
  export default {
    components: {
      EditorContent,
      EditorMenuBar,
    },
    props: {
      value: {
        type: Object,
        default: () => {},
      },
    },
    data () {
      return {
        json: {},
        editor: new Editor({
          extensions: [
            new Image(),
            new Blockquote(),
            new BulletList(),
            new CodeBlock(),
            new HardBreak(),
            new Heading({ levels: [1, 2, 3] }),
            new HorizontalRule(),
            new ListItem(),
            new OrderedList(),
            new TodoItem(),
            new TodoList(),
            new Link(),
            new Bold(),
            new Code(),
            new Italic(),
            new Strike(),
            new Underline(),
            new History(),
            new Placeholder({
              emptyEditorClass: 'is-editor-empty',
              emptyNodeClass: 'is-empty',
              emptyNodeText: 'Write something …',
              showOnlyWhenEditable: true,
              showOnlyCurrent: true,
            }),
          ],
          content: '',
          onUpdate: ({ getJSON, getHTML }) => {
            this.$emit('input', getJSON())
          },
        }),
      }
    },

    computed: {
      editItems () {
        /*
        return [
          this.isActive.bold(),
        ]
        */
        return [
          {
            icon: 'mdi-format-bold',
            action: this.editor.commands.bold,
            activate: this.editor.isActive.bold(),
          },
          {
            icon: 'mdi-format-italic',
            action: this.editor.commands.italic,
            activate: this.editor.isActive.italic(),
          },
          {
            icon: 'mdi-format-list-bulleted',
            action: this.editor.commands.bullet_list,
            activate: this.editor.isActive.bullet_list(),
          },
        ]
      },
    },

    beforeDestroy () {
      this.editor.destroy()
    },
  }
</script>

<style>
  .ProseMirror {
    color: black;
    margin: 5px;
  }

  .ProseMirror:focus {
    outline: none;
  }

  .editor__content {
    background-color: rgba(100, 100, 100, 0.1);
    overflow-y: scroll;
    height: 350px;
    cursor: text;
    padding: 5px;
  }
</style>
