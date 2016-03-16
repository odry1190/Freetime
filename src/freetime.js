'use strict';

import moment from 'moment';

class Freetime {

  constructor(options) {

    this.only_office_schedule = true;
    this.office_schedule_start = moment({ hour : 8, minute : 0, second : 0 });
    this.office_schedule_end = moment({ hour: 17, minute  :0, second : 0 });

    if (options) {
      if (options.hasOwnProperty('office_schedule_start')) {
        if (options.office_schedule_start instanceof Date) {
          this.office_schedule_start = moment({
            hour : options.office_schedule_start.getHours(),
            minute : options.office_schedule_start.getMinutes(),
            second : options.office_schedule_start.getSeconds()
          });
        }
        if (typeof options.office_schedule_start === 'string') {
          if (/^[0-2]?\d:[0-5]\d:[0-5]\d$/.test(options.office_schedule_start)) {
            this.office_schedule_start = moment(options.office_schedule_start, 'HH:mm:ss');
          } else {
            throw TypeError("'office_schedule_start' must be a Date or String with the format 'HH:mm:ss'");
          }
        }
        if (moment.isMoment(options.office_schedule_start)) {
          this.office_schedule_start = moment({
            hour : options.office_schedule_start.get('hour'),
            minute : options.office_schedule_start.get('minute'),
            second : options.office_schedule_start.get('second')
          });
        }
      }
      if (options.hasOwnProperty('office_schedule_end')) {
        if (options.office_schedule_end instanceof Date) {
          this.office_schedule_end = moment({
            hour : options.office_schedule_end.getHours(),
            minute : options.office_schedule_end.getMinutes(),
            second : options.office_schedule_end.getSeconds()
          });
        }
        if (typeof options.office_schedule_end === 'string') {
          if (/^[0-2]?\d:[0-5]\d:[0-5]\d$/.test(options.office_schedule_end)) {
            this.office_schedule_end = moment(options.office_schedule_end, 'HH:mm:ss');
          } else {
            throw TypeError("'office_schedule_end' must be a Date or String with the format 'HH:mm:ss'");
          }
        }
        if (moment.isMoment(options.office_schedule_end)) {
          this.office_schedule_end = moment({
            hour : options.office_schedule_end.get('hour'),
            minute : options.office_schedule_end.get('minute'),
            second : options.office_schedule_end.get('second')
          });
        }
      }
      if (options.hasOwnProperty('only_office_schedule')) {
        if (typeof options.only_office_schedule === 'boolean') {
          this.only_office_schedule = options.only_office_schedule;
          if (!this.only_office_schedule) {
              this.office_schedule_start = moment({ hour : 0, minute : 0, second : 0 });
              this.office_schedule_end = moment({ hour : 23, minute : 59, second : 59 });
          }
        } else {
          throw TypeError("'only_office_schedule' must be a Boolean");
        }
      }
    }

    if (this.office_schedule_start.unix() > this.office_schedule_end.unix()) {
      throw new RangeError("'office_schedule_start' must be greatter than 'office_schedule_end'");
    }
  }

  calculate_freetime(tasks_raw) {
    if (tasks_raw === undefined) {
      if (this.only_office_schedule) {
        return [{start : this.office_schedule_start, end : this.office_schedule_end}];
      } else {
        return [{start : moment('00:00:00', 'HH:mm:ss'), end : moment('23:59:59', 'HH:mm:ss')}];
      }
    }
    if (!Array.isArray(tasks_raw)) {
      throw new TypeError('Parameter must be an Array');
    }
    if (this.only_office_schedule) {
      let start = this.office_schedule_start;
      let end = this.office_schedule_end;
      if (tasks_raw.length === 0) {
        return [{start, end}];
      }
      let tasks = this.standarize_sort_tasks(tasks_raw, start, end);
      return this._get_freetime(tasks, start, end);
    } else {
      let start = moment({ hour: 0, minute : 0, second : 0 });
      let end = moment({ hour: 23, minute : 59, second : 59 });
      if (tasks_raw.length === 0) {
        return [{start, end}];
      }
      let tasks = this.standarize_sort_tasks(tasks_raw, start, end);
      return this._get_freetime(tasks, start, end);
    }
  }

  sort_tasks (tasks) {
    // check no end tasks
    tasks.sort(function(task1, task2) {
      if (task1.start.unix()  === task2.start.unix()) {
        if (task1.end.unix() === task2.end.unix()) {
          return 0;
        }
        if(task1.end.unix() > task2.end.unix()) {
          return 1;
        } else {
          return -1
        }
      }
      if (task1.start.unix() > task2.start.unix()) {
        return 1;
      } else {
        return -1;
      }
    });
    return tasks;
  }

  standarize_tasks(tasks_raw) {
    let end = this.office_schedule_end;
    let tasks = tasks_raw.map(function(task) {
      if (task.hasOwnProperty('start')) {
        if (task.start instanceof Date) {
          task.start = moment({ hour : task.start.getHours(), minute : task.start.getMinutes(), second : task.start.getSeconds()});
        }
        if (typeof task.start === 'string') {
          if (/^[0-2]?\d:[0-5]\d:[0-5]\d$/.test(task.start)) {
            task.start = moment(task.start, 'HH:mm:ss');
          } else {
            throw TypeError("'start' must be a Date or String with the format 'HH:mm:ss'");
          }
        }
      } else {
        throw TypeError("'start' must be a Date or String with the format 'HH:mm:ss'");
      }
      if (task.hasOwnProperty('end')) {
        if (task.end instanceof Date) {
          task.end = moment({ hour : task.end.getHours(), minute : task.end.getMinutes(), second : task.end.getSeconds()});
        }
        if (typeof task.end === 'string') {
          if (/^[0-2]?\d:[0-5]\d:[0-5]\d$/.test(task.end)) {
            task.end = moment(task.end, 'HH:mm:ss');
          } else {
            throw TypeError("'end' must be a Date or String with the format 'HH:mm:ss'");
          }
        }
      } else {
        task.end = end;
      }
      if (task.start.unix() > task.end.unix()) {
        throw new RangeError("'start' must be greatter than 'end'");
      }
      return task;
    });
    return tasks;
  }

  standarize_sort_tasks(tasks_raw, start, end) {
    let tasks = this.standarize_tasks(tasks_raw);
    let sorted = this.sort_tasks(tasks, start, end);
    return sorted;
  }

  _get_freetime(tasks, start, end) {
    let free = [];
    tasks.forEach(function(task) {
      // 3
      if ((start.unix() >= task.start.unix()) && end.unix() > task.end.unix()) {
        start = task.end;
      }
      // 4
      if (start.unix() < task.start.unix() && end.unix() === task.end.unix()) {
        free.push({start, end : task.start});
        start = task.end;
      }
      // 5
      if (start.unix() < task.start.unix() && end > task.end.unix()) {
        free.push({start, end : task.start});
        start = task.end;
      }
    });
    if (start.unix() < end.unix()) {
      free.push({start, end});
    }
    return free;
  }
}

export default (options) => {
    return new Freetime(options);
};
