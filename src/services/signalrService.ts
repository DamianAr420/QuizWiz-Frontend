import * as signalR from "@microsoft/signalr";

class SignalRService {
  private connection: signalR.HubConnection | null = null;

  initConnection(token: string) {
    const hubBase = import.meta.env.VITE_HUB_URL;

    const finalUrl = hubBase.endsWith("/")
      ? `${hubBase}multiplayer`
      : `${hubBase}/multiplayer`;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(finalUrl, {
        accessTokenFactory: () => token,
        skipNegotiation: false,
        transport:
          signalR.HttpTransportType.WebSockets |
          signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect()
      .build();

    return this.connection.start();
  }

  on(eventName: string, callback: (...args: any[]) => void) {
    this.connection?.on(eventName, callback);
  }

  async invoke(methodName: string, ...args: any[]) {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return this.connection.invoke(methodName, ...args);
    } else {
      throw new Error(
        `Nie można wywołać ${methodName}. Status połączenia: ${this.connection?.state}`,
      );
    }
  }

  off(eventName: string) {
    if (this.connection) {
      this.connection.off(eventName);
    }
  }

  async startConnection() {
    if (
      this.connection &&
      this.connection.state === signalR.HubConnectionState.Disconnected
    ) {
      await this.connection.start();
    }
  }

  stopConnection() {
    if (this.connection) {
      this.connection.stop();
      this.connection = null;
    }
  }

  public get isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

export const signalRService = new SignalRService();
