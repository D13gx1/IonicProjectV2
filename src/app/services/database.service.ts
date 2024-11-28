// database.service.ts
import { capSQLiteChanges, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Injectable } from '@angular/core';
import { SQLiteService } from './sqlite.service';
import { User } from '../model/user';
import { BehaviorSubject } from 'rxjs';
import { EducationalLevel } from '../model/educational-level';
import { showAlertError } from '../tools/message-functions';
import { convertDateToString, convertStringToDate } from '../tools/date-functions';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private dataBaseName = 'DinosaurDataBase';
  private db!: SQLiteDBConnection;
  userList: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);

  adminUser = User.getNewUsuario(
    'admin',
    'admin@duocuc.cl',
    'admin',
    '¿Cuál es tu rol?',
    'administrador',
    'Admin',
    'DuocUC',
    EducationalLevel.findLevel(6)!,
    new Date(2000, 0, 1),
    'Santiago',
    'default-image.jpg'
  );

  testUser1 = User.getNewUsuario(
    'atorres', 
    'atorres@duocuc.cl', 
    '1234', 
    '¿Cuál es tu animal favorito?', 
    'gato',
    'Ana', 
    'Torres', 
    EducationalLevel.findLevel(6)!,
    new Date(2000, 0, 5),
    'La Florida',
    'default-image.jpg');

  testUser2 = User.getNewUsuario(
    'jperez', 
    'jperez@duocuc.cl', 
    '5678', 
    '¿Cuál es tu postre favorito?',
    'panqueques',
    'Juan', 
    'Pérez',
    EducationalLevel.findLevel(5)!,
    new Date(2000, 1, 10),
    'La Pintana',
    'default-image.jpg');

  testUser3 = User.getNewUsuario(
    'cmujica', 
    'cmujica@duocuc.cl', 
    '0987', 
    '¿Cuál es tu vehículo favorito?',
    'moto',
    'Carla', 
    'Mujica', 
    EducationalLevel.findLevel(6)!,
    new Date(2000, 2, 20),
    'Providencia',
    'default-image.jpg');

  userUpgrades = [
    {
      toVersion: 1,
      statements: [`
        CREATE TABLE IF NOT EXISTS USER (
          userName         TEXT PRIMARY KEY NOT NULL,
          email            TEXT NOT NULL,
          password         TEXT NOT NULL,
          secretQuestion   TEXT NOT NULL,
          secretAnswer     TEXT NOT NULL,
          firstName        TEXT NOT NULL,
          lastName         TEXT NOT NULL,
          educationalLevel INTEGER NOT NULL,
          dateOfBirth      TEXT NOT NULL,
          address          TEXT NOT NULL,
          image            TEXT NOT NULL
        );
      `]
    }
  ];

  constructor(private sqliteService: SQLiteService) { }

  async initializeDataBase() {
    try {
      await this.sqliteService.createDataBase({ database: this.dataBaseName, upgrade: this.userUpgrades });
      this.db = await this.sqliteService.open(this.dataBaseName, false, 'no-encryption', 1, false);
      await this.createTestUsers();
      await this.readUsers();
    } catch (error) {
      showAlertError('DataBaseService.initializeDataBase', error);
    }
  }

  private async createTestUsers() {
    try {
      if (!(await this.readUser(this.adminUser.userName))) {
        await this.saveUser(this.adminUser);
      }
      if (!(await this.readUser(this.testUser1.userName))) {
        await this.saveUser(this.testUser1);
      }
      if (!(await this.readUser(this.testUser2.userName))) {
        await this.saveUser(this.testUser2);
      }
      if (!(await this.readUser(this.testUser3.userName))) {
        await this.saveUser(this.testUser3);
      }
    } catch (error) {
      showAlertError('DataBaseService.createTestUsers', error);
    }
  }

  async saveUser(user: User): Promise<void> {
    const sqlInsertUpdate = `
      INSERT OR REPLACE INTO USER (
        userName, 
        email, 
        password, 
        secretQuestion, 
        secretAnswer,
        firstName, 
        lastName,
        educationalLevel, 
        dateOfBirth,
        address,
        image
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
    try {
      await this.db.run(sqlInsertUpdate, [
        user.userName, 
        user.email, 
        user.password,
        user.secretQuestion, 
        user.secretAnswer, 
        user.firstName, 
        user.lastName,
        user.educationalLevel.id, 
        convertDateToString(user.dateOfBirth), 
        user.address,
        user.image
      ]);
      await this.readUsers();
    } catch (error) {
      showAlertError('DataBaseService.saveUser', error);
    }
  }

  async readUsers(): Promise<User[]> {
    try {
      const q = 'SELECT * FROM USER;';
      const rows = (await this.db.query(q)).values;
      const users = rows?.length ? rows.map((row: any) => this.rowToUser(row)) : [];
      this.userList.next(users);
      return users;
    } catch (error) {
      showAlertError('DataBaseService.readUsers', error);
      return [];
    }
  }

  async readUser(userName: string): Promise<User | undefined> {
    try {
      const q = 'SELECT * FROM USER WHERE userName=?;';
      const rows = (await this.db.query(q, [userName])).values;
      return rows?.length ? this.rowToUser(rows[0]) : undefined;
    } catch (error) {
      showAlertError('DataBaseService.readUser', error);
      return undefined;
    }
  }

  async deleteByUserName(userName: string): Promise<boolean> {
    try {
      const q = 'DELETE FROM USER WHERE userName=?';
      const result: capSQLiteChanges = await this.db.run(q, [userName]);
      await this.readUsers();
      return (result.changes?.changes ?? 0) > 0;
    } catch (error) {
      showAlertError('DataBaseService.deleteByUserName', error);
      return false;
    }
  }

  async findUser(userName: string, password: string): Promise<User | undefined> {
    try {
      const q = 'SELECT * FROM USER WHERE userName=? AND password=?;';
      const rows = (await this.db.query(q, [userName, password])).values;
      return rows?.length ? this.rowToUser(rows[0]) : undefined;
    } catch (error) {
      showAlertError('DataBaseService.findUser', error);
      return undefined;
    }
  }

  async findUserByEmail(email: string): Promise<User | undefined> {
    try {
      const q = 'SELECT * FROM USER WHERE email = ?';
      const rows = (await this.db.query(q, [email])).values;
      return rows?.length ? this.rowToUser(rows[0]) : undefined;
    } catch (error) {
      showAlertError('DataBaseService.findUserByEmail', error);
      return undefined;
    }
  }

  private rowToUser(row: any): User {
    try {
      if (!row) {
        throw new Error("No se encontró el usuario en la base de datos.");
      }
      const user = new User();
      user.userName = row.userName;
      user.email = row.email;
      user.password = row.password;
      user.secretQuestion = row.secretQuestion;
      user.secretAnswer = row.secretAnswer;
      user.firstName = row.firstName;
      user.lastName = row.lastName;
      user.educationalLevel = EducationalLevel.findLevel(row.educationalLevel) || new EducationalLevel();
      user.dateOfBirth = convertStringToDate(row.dateOfBirth);
      user.address = row.address;
      user.image = row.image;
      return user;
    } catch (error) {
      showAlertError('DataBaseService.rowToUser', error);
      return new User();
    }
  }
}