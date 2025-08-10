export class Logger {
  private clientId: string;

  constructor(clientId: string) {
    this.clientId = clientId;
  }

  public log(message: string) {
    console.log(`[${this.clientId}] - ${message}`);
  }
}
