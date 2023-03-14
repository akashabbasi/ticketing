import { Subjects, Publisher, ExpirationCompleteEvent } from '@devsmash/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
