export interface TodoListMessages {
  [key: string]: string;
}

export interface PagesWithTodoListMessages {
  todoList: TodoListMessages;
}
