const { createApp } = Vue;

class Todo {
  constructor(name, color = "#000000") {
    this.name = name;
    this.color = color;
    this.done = false;
  }
}

const firstTodo = new Todo("finish homework");
const secondTodo = new Todo("buy milk");

if (window.localStorage.getItem('list') === null || window.localStorage.getItem('list') === "") {
  window.localStorage.setItem('list', JSON.stringify([firstTodo, secondTodo]));
}

const config = {
  data: function () {
    return {
      appTitle: "My Todo List",
      todoList: JSON.parse(window.localStorage.getItem('list')),
      formData: {
        name: null,
        color: null
      },
      editing: null
    };
  },
  computed: {
    finishedTodoLength() {
      return this.todoList.filter((t) => t.done).length;
    }
  },
  methods: {
    resetForm() {
      this.formData = {
        name: null,
        color: null
      };
    },
    store() {
      window.localStorage.setItem('list', JSON.stringify(this.todoList));
      console.log(JSON.stringify(this.todoList));
    },
    addTodo: function (event) {
      const { name, color } = this.formData;

      if (this.editing) {
        Object.assign(this.editing, { name, color });

        this.editing = null;
      } else {
        const todo = new Todo(name, color);
        this.todoList.push(todo);
      }

      this.resetForm();
      this.store();
    },
    editTodo(todo) {
      this.editing = todo;

      const { name, color } = todo;
      Object.assign(this.formData, { name, color });
    },
    cancelEditing() {
      this.editing = null;
      this.resetForm();
      this.store();
    },
    delTodo(todo) {
      const idx = this.todoList.indexOf(todo);
      if (idx > -1) {
        this.todoList.splice(idx, 1);
      }
      this.store();
    }
  },
  mounted() {
    setInterval(() => {
      this.store();
    }, 1)
  }
};

const app = createApp(config);

app.mount("#app");
