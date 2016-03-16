'use strict';

import Freetime from './../src/freetime';
import {expect} from 'chai';
import moment from 'moment';

describe('Freetime', () => {

  describe('Initializing with default attributes', () => {

    it("Should initialize all the attributes with a default value", () => {
      let t = new Freetime();
      expect(t.only_office_schedule).to.be.eq(true);
      expect(t.office_schedule_start.format('HH:mm:ss')).to.be.eq('08:00:00');
      expect(t.office_schedule_end.format('HH:mm:ss')).to.be.eq('17:00:00');
    });

  });

  describe('Custom initialization of the attributes', () => {

    it("Should let the user set 'only_office_schedule' to false", () => {
      let t = Freetime({only_office_schedule : false});
      expect(t.only_office_schedule).to.be.eq(false);
      expect(t.office_schedule_start.format('HH:mm:ss')).to.be.eq('00:00:00');
      expect(t.office_schedule_end.format('HH:mm:ss')).to.be.eq('23:59:59');
    });

    it("Should throw an error if 'only_office_schedule' is not boolean", () => {
      expect(() => {
        Freetime({only_office_schedule : '106:004:050'});
      }).to.throw(TypeError, "'only_office_schedule' must be a Boolean");
    });

    it("Should let the user set 'office_schedule_start' and 'office_schedule_end' as JS Date", () =>{
      let t = Freetime({
        office_schedule_start : new Date(2016, 5, 11, 10, 0, 0, 0),
        office_schedule_end : new Date(2016, 5, 11, 14, 0, 0, 0)
      });
      expect(t.only_office_schedule).to.be.eq(true);
      expect(t.office_schedule_start.format('HH:mm:ss')).to.be.eq('10:00:00');
      expect(t.office_schedule_end.format('HH:mm:ss')).to.be.eq('14:00:00');
    });

    it("Should let the user set 'office_schedule_start' and 'office_schedule_end' as Momentjs", () => {
      let t = Freetime({
        office_schedule_start : moment({ hour : 10, minute : 0, second : 0}),
        office_schedule_end : moment({ hour : 14, minute : 0, second : 0})
      });
      expect(t.only_office_schedule).to.be.eq(true);
      expect(t.office_schedule_start.format('HH:mm:ss')).to.be.eq('10:00:00');
      expect(t.office_schedule_end.format('HH:mm:ss')).to.be.eq('14:00:00');
    });

    it("Should let the user set 'office_schedule_start' and 'office_schedule_end' as String", () => {
      let t = Freetime({
        office_schedule_start : '10:00:00',
        office_schedule_end : '14:00:00'
      });
      expect(t.office_schedule_start.format('HH:mm:ss')).to.be.eq('10:00:00');
      expect(t.office_schedule_end.format('HH:mm:ss')).to.be.eq('14:00:00');
    });

    it("Should throw an Error if 'office_schedule_start' is not a correct formated string", () => {
      expect(() => {
        Freetime({office_schedule_start : '106:004:050'});
      }).to.throw(TypeError, "'office_schedule_start' must be a Date or String with the format 'HH:mm:ss'");
    });

    it("Should throw an Error if 'office_schedule_end' is not a crrect formated string", () => {
      expect(() => {
        Freetime({office_schedule_end : '106:004:050'});
      }).to.throw(TypeError, "'office_schedule_end' must be a Date or String with the format 'HH:mm:ss'");
    });

    it("Should throw an Error if 'office_schedule_start' is greatter than 'office_schedule_end'", () => {
      expect(() => {
        Freetime({
          office_schedule_start : '14:00:00',
          office_schedule_end : '8:00:00'
        });
      }).to.throw(RangeError, "'office_schedule_start' must be greatter than 'office_schedule_end'");
    });

  });

  describe('Freetime objects', () => {

    it('Should create new objects of Freetime', () => {
      let t1 = Freetime({
        only_office_schedule : true,
        office_schedule_start : '10:00:00',
        office_schedule_end : '14:00:00'
      });
      let t2 = new Freetime();

      expect(t1.only_office_schedule).to.be.eq(true);
      expect(t1.office_schedule_start.format('HH:mm:ss')).to.be.eq('10:00:00');
      expect(t1.office_schedule_end.format('HH:mm:ss')).to.be.eq('14:00:00');

      expect(t2.only_office_schedule).to.be.eq(true);
      expect(t2.office_schedule_start.format('HH:mm:ss')).to.be.eq('08:00:00');
      expect(t2.office_schedule_end.format('HH:mm:ss')).to.be.eq('17:00:00');
    });

  });

  describe('#standarize_tasks', () => {

    it("Should transform a JS Date to Momentjs in start and end", () =>{
      let t1 = Freetime();
      let tasks = [
        {
          start : new Date(2016, 5, 11, 10, 0, 0, 0),
          end : new Date(2016, 5, 11, 11, 0, 0, 0)
        }
      ];
      tasks = t1.standarize_tasks(tasks);
      expect(tasks).to.be.an.instanceof(Array);
      expect(moment.isMoment(tasks[0].start)).to.eq(true);
      expect(moment.isMoment(tasks[0].end)).to.eq(true);
    });

    it("Should assume the end of a task is 'office_schedule_end' if 'end' is not present", () =>{
      let t1 = Freetime();
      let tasks = [
        {
          start : moment({ hour : 9, minute : 0, second : 0})
        }
      ];
      tasks = t1.standarize_tasks(tasks);
      expect(tasks).to.be.an.instanceof(Array);
      expect(tasks.length).to.eq(1);
      expect(tasks[0].start.format('HH:mm:ss')).to.eq('09:00:00');
      expect(tasks[0].end.format('HH:mm:ss')).to.eq('17:00:00');
    });

    it("Should assume the end of a task is 'office_schedule_end' if 'end' is not present on multiple tasks", () =>{
      let t1 = Freetime();
      let tasks = [
        {
          start : moment({ hour : 9, minute : 0, second : 0})
        },
        {
          start : moment({ hour : 10, minute : 0, second : 0})
        },
        {
          start : moment({ hour : 11, minute : 0, second : 0})
        }
      ];
      tasks = t1.standarize_tasks(tasks);
      expect(tasks).to.be.an.instanceof(Array);
      expect(tasks.length).to.eq(3);
      expect(tasks[0].start.format('HH:mm:ss')).to.eq('09:00:00');
      expect(tasks[0].end.format('HH:mm:ss')).to.eq('17:00:00');
      expect(tasks[1].start.format('HH:mm:ss')).to.eq('10:00:00');
      expect(tasks[1].end.format('HH:mm:ss')).to.eq('17:00:00');
      expect(tasks[2].start.format('HH:mm:ss')).to.eq('11:00:00');
      expect(tasks[2].end.format('HH:mm:ss')).to.eq('17:00:00');
    });

    it("Should throw an Error if 'start' is not a correct formated string", () => {
      let t1 = Freetime();
      let tasks = [
        {
          start : "0a8:0s0:00s"
        }
      ];
      expect(() => {
        t1.standarize_tasks(tasks);
      }).to.throw(TypeError, "'start' must be a Date or String with the format 'HH:mm:ss'");
    });

    it("Should throw an Error if 'start' does not exist as part of the task", () => {
      let t1 = Freetime();
      let tasks = [
        {
          end : "12:00:00"
        }
      ];
      expect(() => {
        t1.standarize_tasks(tasks);
      }).to.throw(TypeError, "'start' must be a Date or String with the format 'HH:mm:ss'");
    });

    it("Should throw an Error if 'end' is not a crrect formated string", () => {
      let t1 = Freetime();
      let tasks = [
        {
          start : "08:00:00",
          end : "adfsdfasdf"
        }
      ];
      expect(() => {
        t1.standarize_tasks(tasks);
      }).to.throw(TypeError, "'end' must be a Date or String with the format 'HH:mm:ss'");
    });

    it("Should throw an Error if 'start' is greatter than 'end'", () => {
      let t1 = Freetime();
      let tasks = [
        {
          start : '14:00:00',
          end : '8:00:00'
        }
      ];
      expect(() => {
        t1.standarize_tasks(tasks);
      }).to.throw(RangeError, "'start' must be greatter than 'end'");
    });

  });

  describe('#sort_tasks', () => {

    it('Should order unordered tasks', () => {
      let t1 = Freetime();
      let tasks = [
        { start : moment({ hour : 9, minute : 0, second : 0}) },
        { start : moment({ hour : 8, minute : 0, second : 0}) }
      ];
      tasks = t1.sort_tasks(tasks);
      expect(tasks[0].start.format('HH:mm:ss')).to.eq('08:00:00');
      expect(tasks[1].start.format('HH:mm:ss')).to.eq('09:00:00');
    });

    it('Should put first a tasks with a same start but an earlier end', () => {
      let t1 = Freetime();
      let tasks = [
        {
          start : moment({ hour : 9, minute : 0, second : 0}),
          end : moment({ hour : 9, minute : 45, second : 0})
        },
        {
          start : moment({ hour : 9, minute : 0, second : 0}),
          end : moment({ hour : 9, minute : 30, second : 0})
        }
      ];
      tasks = t1.sort_tasks(tasks);
      expect(tasks[0].start.format('HH:mm:ss')).to.eq('09:00:00');
      expect(tasks[0].end.format('HH:mm:ss')).to.eq('09:30:00');
      expect(tasks[1].start.format('HH:mm:ss')).to.eq('09:00:00');
      expect(tasks[1].end.format('HH:mm:ss')).to.eq('09:45:00');
    });

    it('Should let tasks with the same start and end together', () => {
      let t1 = Freetime();
      let tasks = [
        { start : moment({ hour : 9, minute : 0, second : 0}) },
        { start : moment({ hour : 8, minute : 0, second : 0}), end : moment({ hour : 17, minute : 0, second : 0}) },
        { start : moment({ hour : 8, minute : 0, second : 0}), end : moment({ hour : 17, minute : 0, second : 0}) }
      ];
      tasks = t1.sort_tasks(tasks);
      expect(tasks[0].start.format('HH:mm:ss')).to.eq('08:00:00');
      expect(tasks[1].start.format('HH:mm:ss')).to.eq('08:00:00');
      expect(tasks[2].start.format('HH:mm:ss')).to.eq('09:00:00');
    });

  });

  describe('#calculate_freetime', () => {

    it('Should throw an error if parameter is not Array', () => {
      let t1 = Freetime();
      expect(t1.calculate_freetime.bind(t1, 'Error')).to.throw(TypeError);
      expect(t1.calculate_freetime.bind(t1, {start : '08:00:00'})).to.throw(TypeError);
    });

    describe('With defaults of office schedule from 8 to 17', () => {

      it('Should return the whole office day if the parameter is undefined', () => {
        let t1 = Freetime();
        let free = t1.calculate_freetime();
        expect(free).to.be.an.instanceof(Array);
        expect(free.length).to.eq(1);
        expect(free[0].start.format('HH:mm:ss')).to.eq('08:00:00');
        expect(free[0].end.format('HH:mm:ss')).to.eq('17:00:00');
      });

      it('Should return the whole office day if the array of tasks is empty', () => {
        let t1 = Freetime();
        let free = t1.calculate_freetime([]);
        expect(free).to.be.an.instanceof(Array);
        expect(free.length).to.eq(1);
        expect(free[0].start.format('HH:mm:ss')).to.eq('08:00:00');
        expect(free[0].end.format('HH:mm:ss')).to.eq('17:00:00');
      });

      it('Should return the afternoon if the morning is occupied', () => {
        let t1 = Freetime();
        let tasks = [
          {
            start : moment({ hour : 8, minute : 0, second : 0}),
            end : '12:00:00'
          }
        ];
        let free = t1.calculate_freetime(tasks);
        expect(free).to.be.an.instanceof(Array);
        expect(free.length).to.eq(1);
        expect(free[0].start.format('HH:mm:ss')).to.eq('12:00:00');
        expect(free[0].end.format('HH:mm:ss')).to.eq('17:00:00');
      });

      it('Should return the morning if the afternoon is occupied', () => {
        let t1 = Freetime();
        let tasks = [
          {
            start : '13:00:00',
            end : '17:00:00'
          }
        ];
        let free = t1.calculate_freetime(tasks);
        expect(free).to.be.an.instanceof(Array);
        expect(free.length).to.eq(1);
        expect(free[0].start.format('HH:mm:ss')).to.eq('08:00:00');
        expect(free[0].end.format('HH:mm:ss')).to.eq('13:00:00');
      });

      it('Should return the morning and the afternoon the midday is occupied', () => {
        let t1 = Freetime();
        let tasks = [
          {
            start : moment({ hour : 12, minute : 0, second : 0}),
            end : moment({ hour : 13, minute : 0, second : 0})
          }
        ];
        let free = t1.calculate_freetime(tasks);
        expect(free).to.be.an.instanceof(Array);
        expect(free.length).to.eq(2);
        expect(free[0].start.format('HH:mm:ss')).to.eq('08:00:00');
        expect(free[0].end.format('HH:mm:ss')).to.eq('12:00:00');
        expect(free[1].start.format('HH:mm:ss')).to.eq('13:00:00');
        expect(free[1].end.format('HH:mm:ss')).to.eq('17:00:00');
      });

      it('Should return several hours of free time', () => {
        let t1 = Freetime();
        let tasks = [
          {
            start : moment({ hour : 8, minute : 0, second : 0}),
            end : moment({ hour : 9, minute : 0, second : 0})
          },
          {
            start : moment({ hour : 10, minute : 0, second : 0}),
            end : moment({ hour : 11, minute : 0, second : 0})
          },
          {
            start : moment({ hour : 12, minute : 0, second : 0}),
            end : moment({ hour : 13, minute : 0, second : 0})
          },
          {
            start : moment({ hour : 14, minute : 0, second : 0}),
            end : moment({ hour : 17, minute : 0, second : 0})
          },
        ];
        let free = t1.calculate_freetime(tasks);
        expect(free).to.be.an.instanceof(Array);
        expect(free.length).to.eq(3);
        expect(free[0].start.format('HH:mm:ss')).to.eq('09:00:00');
        expect(free[0].end.format('HH:mm:ss')).to.eq('10:00:00');
        expect(free[1].start.format('HH:mm:ss')).to.eq('11:00:00');
        expect(free[1].end.format('HH:mm:ss')).to.eq('12:00:00');
        expect(free[2].start.format('HH:mm:ss')).to.eq('13:00:00');
        expect(free[2].end.format('HH:mm:ss')).to.eq('14:00:00');
      });

      it('Should return a free time form 9 to 10 and from 13 to 14', () => {
        let t1 = Freetime();
        let tasks = [
          {
            start : moment({ hour : 8, minute : 0, second : 0}),
            end : moment({ hour : 9, minute : 0, second : 0})
          },
          {
            start : moment({ hour : 10, minute : 0, second : 0}),
            end : moment({ hour : 13, minute : 0, second : 0})
          },
          {
            start : moment({ hour : 14, minute : 0, second : 0}),
            end : moment({ hour : 17, minute : 0, second : 0})
          }
        ];
        let free = t1.calculate_freetime(tasks);
        expect(free).to.be.an.instanceof(Array);
        expect(free.length).to.eq(2);
        expect(free[0].start.format('HH:mm:ss')).to.eq('09:00:00');
        expect(free[0].end.format('HH:mm:ss')).to.eq('10:00:00');
        expect(free[1].start.format('HH:mm:ss')).to.eq('13:00:00');
        expect(free[1].end.format('HH:mm:ss')).to.eq('14:00:00');
      });

      it('Should return the correct free time when there are tasks overlaping', () => {
        let t1 = Freetime();
        let tasks = [
          {
            start : moment({ hour : 9, minute : 0, second : 0}),
            end : moment({ hour : 11, minute : 0, second : 0})
          },
          {
            start : moment({ hour : 10, minute : 0, second : 0}),
            end : moment({ hour : 11, minute : 0, second : 0})
          },
        ];
        let free = t1.calculate_freetime(tasks);
        expect(free).to.be.an.instanceof(Array);
        expect(free.length).to.eq(2);
        expect(free[0].start.format('HH:mm:ss')).to.eq('08:00:00');
        expect(free[0].end.format('HH:mm:ss')).to.eq('09:00:00');
        expect(free[1].start.format('HH:mm:ss')).to.eq('11:00:00');
        expect(free[1].end.format('HH:mm:ss')).to.eq('17:00:00');
      });

      it('Should return the correct Freetime even when the tasks are not ordered', () => {
        let t1 = Freetime();
        let tasks = [
          {
            start : moment({ hour : 10, minute : 0, second : 0}),
            end : moment({ hour : 11, minute : 0, second : 0})
          },
          {
            start : moment({ hour : 9, minute : 0, second : 0}),
            end : moment({ hour : 11, minute : 0, second : 0})
          }
        ];
        let free = t1.calculate_freetime(tasks);
        expect(free).to.be.an.instanceof(Array);
        expect(free.length).to.eq(2);
        expect(free[0].start.format('HH:mm:ss')).to.eq('08:00:00');
        expect(free[0].end.format('HH:mm:ss')).to.eq('09:00:00');
        expect(free[1].start.format('HH:mm:ss')).to.eq('11:00:00');
        expect(free[1].end.format('HH:mm:ss')).to.eq('17:00:00');
      });

      it('Should return the correct free time when there are tasks overlaping and not ordered', () => {
        let t1 = Freetime();
        let tasks = [
          {
            start : moment({ hour : 8, minute : 0, second : 0}),
            end : moment({ hour : 8, minute : 45, second : 0})
          },
          {
            start : moment({ hour : 8, minute : 0, second : 0}),
            end : moment({ hour : 8, minute : 30, second : 0})
          },
          {
            start : moment({ hour : 11, minute : 0, second : 0}),
            end : moment({ hour : 11, minute : 30, second : 0})
          },
          {
            start : moment({ hour : 11, minute : 0, second : 0}),
            end : moment({ hour : 12, minute : 30, second : 0})
          },
          {
            start : moment({ hour : 8, minute : 0, second : 0}),
            end : moment({ hour : 10, minute : 0, second : 0})
          },
        ];
        let free = t1.calculate_freetime(tasks);
        expect(free).to.be.an.instanceof(Array);
        expect(free.length).to.eq(2);
        expect(free[0].start.format('HH:mm:ss')).to.eq('10:00:00');
        expect(free[0].end.format('HH:mm:ss')).to.eq('11:00:00');
        expect(free[1].start.format('HH:mm:ss')).to.eq('12:30:00');
        expect(free[1].end.format('HH:mm:ss')).to.eq('17:00:00');
      });

    });

    describe('With office schedule turn to false', () => {

      it('Should return the whole day if the parameter is undefined', () => {
        let t1 = Freetime({
          only_office_schedule : false
        });
        let free = t1.calculate_freetime();
        expect(free).to.be.an.instanceof(Array);
        expect(free.length).to.eq(1);
        expect(free[0].start.format('HH:mm:ss')).to.eq('00:00:00');
        expect(free[0].end.format('HH:mm:ss')).to.eq('23:59:59');
      });

      it('Should return the whole day if the array of tasks is empty', () => {
        let t1 = Freetime({
          only_office_schedule : false
        });
        let free = t1.calculate_freetime([]);
        expect(free).to.be.an.instanceof(Array);
        expect(free.length).to.eq(1);
        expect(free[0].start.format('HH:mm:ss')).to.eq('00:00:00');
        expect(free[0].end.format('HH:mm:ss')).to.eq('23:59:59');
      });

      it('Should return the afternoon if the morning is occupied', () => {
        let t1 = Freetime({
          only_office_schedule : false
        });
        let tasks = [
          {
            start : moment({ hour : 0, minute : 0, second : 0}),
            end : '12:00:00'
          }
        ];
        let free = t1.calculate_freetime(tasks);
        expect(free).to.be.an.instanceof(Array);
        expect(free.length).to.eq(1);
        expect(free[0].start.format('HH:mm:ss')).to.eq('12:00:00');
        expect(free[0].end.format('HH:mm:ss')).to.eq('23:59:59');
      });

      it('Should return the morning if the afternoon is occupied', () => {
        let t1 = Freetime({
          only_office_schedule : false
        });
        let tasks = [
          {
            start : '13:00:00',
            end : '23:59:59'
          }
        ];
        let free = t1.calculate_freetime(tasks);
        expect(free).to.be.an.instanceof(Array);
        expect(free.length).to.eq(1);
        expect(free[0].start.format('HH:mm:ss')).to.eq('00:00:00');
        expect(free[0].end.format('HH:mm:ss')).to.eq('13:00:00');
      });

      it('Should return the morning, afternoon and night if the midday is occupied', () => {
        let t1 = Freetime({
          only_office_schedule : false
        });
        let tasks = [
          {
            start : moment({ hour : 12, minute : 0, second : 0}),
            end : moment({ hour : 13, minute : 0, second : 0})
          }
        ];
        let free = t1.calculate_freetime(tasks);
        expect(free).to.be.an.instanceof(Array);
        expect(free.length).to.eq(2);
        expect(free[0].start.format('HH:mm:ss')).to.eq('00:00:00');
        expect(free[0].end.format('HH:mm:ss')).to.eq('12:00:00');
        expect(free[1].start.format('HH:mm:ss')).to.eq('13:00:00');
        expect(free[1].end.format('HH:mm:ss')).to.eq('23:59:59');
      });

      it('Should return several lapses of free time', () => {
        let t1 = Freetime({
          only_office_schedule : false
        });
        let tasks = [
          {
            start : moment({ hour : 8, minute : 0, second : 0}),
            end : moment({ hour : 9, minute : 0, second : 0})
          },
          {
            start : moment({ hour : 10, minute : 0, second : 0}),
            end : moment({ hour : 11, minute : 0, second : 0})
          },
          {
            start : moment({ hour : 12, minute : 0, second : 0}),
            end : moment({ hour : 13, minute : 0, second : 0})
          },
          {
            start : moment({ hour : 14, minute : 0, second : 0}),
            end : moment({ hour : 17, minute : 0, second : 0})
          },
        ];
        let free = t1.calculate_freetime(tasks);
        expect(free).to.be.an.instanceof(Array);
        expect(free.length).to.eq(5);
        expect(free[0].start.format('HH:mm:ss')).to.eq('00:00:00');
        expect(free[0].end.format('HH:mm:ss')).to.eq('08:00:00');
        expect(free[1].start.format('HH:mm:ss')).to.eq('09:00:00');
        expect(free[1].end.format('HH:mm:ss')).to.eq('10:00:00');
        expect(free[2].start.format('HH:mm:ss')).to.eq('11:00:00');
        expect(free[2].end.format('HH:mm:ss')).to.eq('12:00:00');
        expect(free[3].start.format('HH:mm:ss')).to.eq('13:00:00');
        expect(free[3].end.format('HH:mm:ss')).to.eq('14:00:00');
        expect(free[4].start.format('HH:mm:ss')).to.eq('17:00:00');
        expect(free[4].end.format('HH:mm:ss')).to.eq('23:59:59');
      });

      it('Should return a free time form 9 to 10 and from 13 to 14', () => {
        let t1 = Freetime({
          only_office_schedule : false
        });
        let tasks = [
          {
            start : moment({ hour : 0, minute : 0, second : 0}),
            end : moment({ hour : 9, minute : 0, second : 0})
          },
          {
            start : moment({ hour : 10, minute : 0, second : 0}),
            end : moment({ hour : 13, minute : 0, second : 0})
          },
          {
            start : moment({ hour : 14, minute : 0, second : 0}),
            end : moment({ hour : 23, minute : 59, second : 59})
          }
        ];
        let free = t1.calculate_freetime(tasks);
        expect(free).to.be.an.instanceof(Array);
        expect(free.length).to.eq(2);
        expect(free[0].start.format('HH:mm:ss')).to.eq('09:00:00');
        expect(free[0].end.format('HH:mm:ss')).to.eq('10:00:00');
        expect(free[1].start.format('HH:mm:ss')).to.eq('13:00:00');
        expect(free[1].end.format('HH:mm:ss')).to.eq('14:00:00');
      });

      it('Should return the correct Freetime even when the tasks are not ordered', () => {
        let t1 = Freetime({
          only_office_schedule : false
        });
        let tasks = [
          {
            start : moment({ hour : 10, minute : 0, second : 0}),
            end : moment({ hour : 11, minute : 0, second : 0})
          },
          {
            start : moment({ hour : 9, minute : 0, second : 0}),
            end : moment({ hour : 11, minute : 0, second : 0})
          }
        ];
        let free = t1.calculate_freetime(tasks);
        expect(free).to.be.an.instanceof(Array);
        expect(free.length).to.eq(2);
        expect(free[0].start.format('HH:mm:ss')).to.eq('00:00:00');
        expect(free[0].end.format('HH:mm:ss')).to.eq('09:00:00');
        expect(free[1].start.format('HH:mm:ss')).to.eq('11:00:00');
        expect(free[1].end.format('HH:mm:ss')).to.eq('23:59:59');
      });

      it('Should return the correct free time when there are tasks overlaping and not ordered', () => {
        let t1 = Freetime({
          only_office_schedule : false
        });
        let tasks = [
          {
            start : moment({ hour : 8, minute : 0, second : 0}),
            end : moment({ hour : 8, minute : 45, second : 0})
          },
          {
            start : moment({ hour : 8, minute : 0, second : 0}),
            end : moment({ hour : 8, minute : 30, second : 0})
          },
          {
            start : moment({ hour : 11, minute : 0, second : 0}),
            end : moment({ hour : 11, minute : 30, second : 0})
          },
          {
            start : moment({ hour : 11, minute : 0, second : 0}),
            end : moment({ hour : 12, minute : 30, second : 0})
          },
          {
            start : moment({ hour : 8, minute : 0, second : 0}),
            end : moment({ hour : 10, minute : 0, second : 0})
          },
        ];
        let free = t1.calculate_freetime(tasks);
        expect(free).to.be.an.instanceof(Array);
        expect(free.length).to.eq(3);
        expect(free[0].start.format('HH:mm:ss')).to.eq('00:00:00');
        expect(free[0].end.format('HH:mm:ss')).to.eq('08:00:00');
        expect(free[1].start.format('HH:mm:ss')).to.eq('10:00:00');
        expect(free[1].end.format('HH:mm:ss')).to.eq('11:00:00');
        expect(free[2].start.format('HH:mm:ss')).to.eq('12:30:00');
        expect(free[2].end.format('HH:mm:ss')).to.eq('23:59:59');
      });

    });

  });

});
