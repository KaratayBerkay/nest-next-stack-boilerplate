import { Injectable } from '@nestjs/common';

// Untagged — proves the metadata filter does NOT match providers without the decorator.
@Injectable()
export class PlainService {}
