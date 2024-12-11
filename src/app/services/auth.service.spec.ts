import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { DatabaseService } from './database.service';
import { Storage } from '@ionic/storage-angular';
import { of, throwError } from 'rxjs';
import { EducationalLevel } from '../model/educational-level';

describe('AuthService', () => {
  let authService: AuthService;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockDbService: jasmine.SpyObj<DatabaseService>;
  let mockStorage: jasmine.SpyObj<Storage>;

  const mockUser = {
    userName: 'jperez@duocuc.cl',
    email: 'jperez@duocuc.cl',
    password: 'password123',
    secretQuestion: 'favoriteColor',
    secretAnswer: 'blue',
    firstName: 'Juan',
    lastName: 'Perez',
    educationalLevel: EducationalLevel.getLevels()[0],
    dateOfBirth: new Date(),
    address: 'Some address',
    image: 'path/to/image',
  };

  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockDbService = jasmine.createSpyObj('DatabaseService', ['findUser']);
    mockStorage = jasmine.createSpyObj('Storage', ['create', 'get', 'set', 'remove']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: mockRouter },
        { provide: DatabaseService, useValue: mockDbService },
        { provide: Storage, useValue: mockStorage },
      ],
    });

    authService = TestBed.inject(AuthService);
  });

  it('should return true if the user is authenticated', async () => {
    mockStorage.get.and.returnValue(Promise.resolve(mockUser));
    spyOn(authService, 'readAuthUser').and.returnValue(Promise.resolve(mockUser));
  
    const result = await authService.isAuthenticated();
  
    expect(result).toBe(true);
  });
  
  it('should return false if there is an error reading the user from storage', async () => {
    mockStorage.get.and.returnValue(Promise.reject('Error'));
  
    const result = await authService.isAuthenticated();
  
    expect(result).toBe(false);
  });

  it('should return the authenticated user from storage', async () => {
    mockStorage.get.and.returnValue(Promise.resolve(mockUser));
  
    const result = await authService.readAuthUser();
  
    expect(result).toEqual(mockUser);
  });
  
  it('should return null if no user is found in storage', async () => {
    mockStorage.get.and.returnValue(Promise.resolve(null));
  
    const result = await authService.readAuthUser();
  
    expect(result).toBeNull();
  });

  it('should save the authenticated user to storage', async () => {
    mockStorage.set.and.returnValue(Promise.resolve());
  
    const result = await authService.saveAuthUser(mockUser);
  
    expect(mockStorage.set).toHaveBeenCalledWith('AUTHENTICATED_USER', mockUser);
    expect(result).toEqual(mockUser);
  });

  it('should delete the authenticated user from storage', async () => {
    mockStorage.remove.and.returnValue(Promise.resolve());
  
    const result = await authService.deleteAuthUser();
  
    expect(mockStorage.remove).toHaveBeenCalledWith('AUTHENTICATED_USER');
    expect(result).toBeTrue();
  });
  
  it('should return false if there is an error deleting the user', async () => {
    mockStorage.remove.and.returnValue(Promise.reject('Error'));
  
    const result = await authService.deleteAuthUser();
  
    expect(result).toBeFalse();
  });
  
  it('should return false if user credentials are incorrect', async () => {
    mockDbService.findUser.and.returnValue(Promise.resolve(undefined));
  
    const result = await authService.login('jperez@duocuc.cl', 'wrongpassword');
  
    expect(result).toBeFalse();
  });
  
  it('should return false if there is an error in the login process', async () => {
    mockDbService.findUser.and.returnValue(Promise.reject('Error'));
  
    const result = await authService.login('jperez@duocuc.cl', 'password123');
  
    expect(result).toBeFalse();
  });

  it('should return the current user ID', () => {
    authService.authUser.next(mockUser);
  
    const result = authService.getCurrentUserId();
  
    expect(result).toBe(mockUser.userName);
  });
  
  it('should return null if no user is authenticated', () => {
    authService.authUser.next(null);
  
    const result = authService.getCurrentUserId();
  
    expect(result).toBeNull();
  });

});
