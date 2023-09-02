import { Component } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Task} from "../dto/task";

@Component({
  selector: 'app-task-container',
  templateUrl: './task-container.component.html',
  styleUrls: ['./task-container.component.scss']
})
export class TaskContainerComponent {

  taskList: Array<Task> = [];
  completedTaskList: Array<Task> = [];
  selectedTask : Task | null = null;


  constructor(private http: HttpClient) {
    http.get<Array<Task>>('http://localhost:8080/app/api/v1/tasks').subscribe(taskList => {
      this.taskList = taskList;
      /*console.log(this.taskList.length);*/
      for (const task of this.taskList){
      if(task.status === 'COMPLETED'){
        this.completedTaskList.push(task);
      }
    }
    this.taskList = this.taskList.filter(task => task.status === 'NOT_COMPLETED');
    /*console.log(this.taskList.length);
    console.log(this.completedTaskList.length);*/
    });

  }


  saveTask(txt: HTMLInputElement) {
    if(!txt.value.trim()) {
      txt.select();
      return;
    }
    if(this.selectedTask === null){
      this.http.post<Task>('http://localhost:8080/app/api/v1/tasks', new Task(0, txt.value, "NOT_COMPLETED")).subscribe(task => {
        this.taskList.push(task);
        txt.value = '';
        txt.focus();
      });
    }else{
      const inputElm = document.getElementById("txt-task") as HTMLInputElement;
      this.selectedTask.description = inputElm.value;
      this.updateTask(this.selectedTask);
      const btnElm = document.getElementById("btn-add") as HTMLButtonElement;
      btnElm.innerText = 'Add New Task';
      inputElm.value = "";
      inputElm.focus();
      this.selectedTask = null;
    }

  }

  deleteTask(task:Task) {
    this.http.delete(`http://localhost:8080/app/api/v1/tasks/${task.id}`).subscribe(data => {
      if (task.status === 'COMPLETED'){
        this.completedTaskList.splice(this.completedTaskList.indexOf(task), 1);

      }else{
        this.taskList.splice(this.taskList.indexOf(task), 1);
      }
    });
  }

  updateTask(task: Task){
    this.http.patch(`http://localhost:8080/app/api/v1/tasks/${task.id}`,task).subscribe(data => {
    });
  }

  completeTask(task:Task){
    let isCompleted:boolean = true;
    if (task.status === 'COMPLETED'){
      task.status = 'NOT_COMPLETED';
      isCompleted = false;
    }else{
      task.status = 'COMPLETED';
    }

    this.updateTask(task);

    if (!isCompleted){
      this.completedTaskList.splice(this.completedTaskList.indexOf(task), 1);
      this.taskList.push(task);
    }else{
      this.taskList.splice(this.taskList.indexOf(task), 1);
      this.completedTaskList.push(task);
    }
  }

  editTask(task: Task) {
    this.selectedTask = task;
    const btnElm = document.getElementById("btn-add") as HTMLButtonElement;
    btnElm.innerText = "Update Task";
    const inputElm = document.getElementById("txt-task") as HTMLInputElement;
    inputElm.value = task.description;
    inputElm.select();
  }
}
