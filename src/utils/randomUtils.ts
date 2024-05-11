import { faker } from '@faker-js/faker';

export const randomDate = (start: Date, end: Date): Date =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

export const randomName = (): string => `${faker.person.firstName()} ${faker.person.lastName()}`;
