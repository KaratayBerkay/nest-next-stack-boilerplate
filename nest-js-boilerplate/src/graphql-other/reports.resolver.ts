import { UseGuards, UseInterceptors } from '@nestjs/common';
import {
  Args,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { FieldTraceInterceptor } from './field-trace.interceptor';
import { Report } from './models/report.model';
import { Trace } from './models/trace.model';
import { PositiveIdGuard } from './positive-id.guard';
import { Selection } from './selection.decorator';
import { TraceService } from './trace.service';

// Class-level interceptor: with `fieldResolverEnhancers: ['interceptors']` on the root module it
// fires for the root @Query AND the @ResolveField below.
@Resolver(() => Report)
@UseInterceptors(FieldTraceInterceptor)
export class ReportsResolver {
  constructor(private readonly traces: TraceService) {}

  // Guard reads args via GqlExecutionContext (rejects id <= 0); @Selection (a custom param
  // decorator) injects the client's requested sub-fields from the GraphQL `info`.
  @Query(() => Report, { name: 'report' })
  @UseGuards(PositiveIdGuard)
  report(
    @Args('id', { type: () => Int }) id: number,
    @Selection() selectedFields: string[],
  ): Report {
    this.traces.setSelection(selectedFields);
    return { id, title: `Report #${id}` };
  }

  // Computed field. The class interceptor fires here only because field-resolver enhancers are on.
  @ResolveField(() => String, { name: 'summary' })
  summary(@Parent() report: Report): string {
    return `summary of ${report.title}`;
  }

  // Reads back the sub-fields the last `report` query selected — proves the @Selection decorator.
  @Query(() => [String], { name: 'reportSelection' })
  reportSelection(): string[] {
    return this.traces.selection;
  }

  // Reads back what the interceptor recorded — proves it fired at both root and field level.
  @Query(() => [Trace], { name: 'traces' })
  recordedTraces(): Trace[] {
    return this.traces.entries;
  }
}
