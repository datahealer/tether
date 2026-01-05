import fetch from 'node-fetch';

interface ExpoPushMessage {
  to: string | string[];
  sound?: 'default' | null;
  title?: string;
  body?: string;
  data?: Record<string, any>;
  badge?: number;
  channelId?: string;
  priority?: 'default' | 'normal' | 'high';
}

interface ExpoPushTicket {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: any;
}

interface ExpoPushResponse {
  data: ExpoPushTicket[];
}

class ExpoProvider {
  private readonly EXPO_API_URL = 'https://exp.host/--/api/v2/push/send';

  /**
   * Send notification via Expo Push Notification service
   */
  async sendNotification(
    deviceToken: string,
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Validate Expo Push Token format
      if (!this.isExpoPushToken(deviceToken)) {
        return {
          success: false,
          error: 'INVALID_TOKEN: Not a valid Expo push token',
        };
      }

      const message: ExpoPushMessage = {
        to: deviceToken,
        sound: 'default',
        title,
        body,
        data,
        badge: 1,
        priority: 'high',
      };

      const response = await fetch(this.EXPO_API_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      console.log(`📡 Expo API response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Expo API error response: ${errorText}`);
        return {
          success: false,
          error: `Expo API error: ${response.status} - ${errorText}`,
        };
      }

      // Expo API can return different formats:
      // Success (single): { data: { status: 'ok', id: '...' } }
      // Success (array): [{ status: 'ok', id: '...' }]
      // Error: { data: { status: 'error', message: '...', details: {...} } }
      const result = await response.json();
      console.log(`📦 Expo API response:`, JSON.stringify(result, null, 2));
      
      let ticket: ExpoPushTicket;
      
      // Handle different response formats
      if (result.data && !Array.isArray(result.data)) {
        // Single object wrapped in data: { data: { status: 'ok', ... } }
        ticket = result.data;
      } else if (Array.isArray(result)) {
        // Array of tickets: [{ status: 'ok', ... }]
        if (result.length === 0) {
          console.error('❌ Empty response array from Expo API');
          return { success: false, error: 'Empty response from Expo API' };
        }
        ticket = result[0];
      } else if (result.data && Array.isArray(result.data)) {
        // Array wrapped in data: { data: [{ status: 'ok', ... }] }
        if (result.data.length === 0) {
          console.error('❌ Empty data array from Expo API');
          return { success: false, error: 'Empty response from Expo API' };
        }
        ticket = result.data[0];
      } else {
        console.error('❌ Unknown Expo API response format:', JSON.stringify(result));
        return { success: false, error: 'Invalid response format from Expo API' };
      }

      // Validate ticket structure
      if (!ticket || !ticket.status) {
        console.error('Invalid ticket structure:', JSON.stringify(ticket));
        return {
          success: false,
          error: 'Invalid ticket in Expo API response',
        };
      }

      if (ticket.status === 'error') {
        // Handle specific error types
        if (ticket.message?.includes('DeviceNotRegistered') || 
            ticket.message?.includes('InvalidCredentials')) {
          return { success: false, error: 'INVALID_TOKEN' };
        }
        return { 
          success: false, 
          error: ticket.message || 'Unknown Expo error',
          messageId: ticket.details?.error
        };
      }

      return {
        success: true,
        messageId: ticket.id,
      };
    } catch (error: any) {
      console.error('Expo push notification error:', error);
      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }

  /**
   * Send notifications to multiple devices
   */
  async sendMulticast(
    deviceTokens: string[],
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<{
    successCount: number;
    failureCount: number;
    responses: any[];
  }> {
    if (deviceTokens.length === 0) {
      return { successCount: 0, failureCount: 0, responses: [] };
    }

    try {
      // Filter valid Expo tokens
      const validTokens = deviceTokens.filter(token => this.isExpoPushToken(token));
      
      if (validTokens.length === 0) {
        return {
          successCount: 0,
          failureCount: deviceTokens.length,
          responses: deviceTokens.map(token => ({
            success: false,
            error: 'INVALID_TOKEN',
            token,
          })),
        };
      }

      // Expo allows sending to multiple tokens in a single request
      const messages: ExpoPushMessage[] = validTokens.map(token => ({
        to: token,
        sound: 'default',
        title,
        body,
        data,
        badge: 1,
        priority: 'high',
      }));

      const response = await fetch(this.EXPO_API_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          successCount: 0,
          failureCount: validTokens.length,
          responses: validTokens.map(token => ({
            success: false,
            error: `Expo API error: ${response.status}`,
            token,
          })),
        };
      }

      // Expo API returns array directly
      const result = await response.json();
      const tickets = Array.isArray(result) ? result : [];
      
      let successCount = 0;
      let failureCount = 0;
      const responses = tickets.map((ticket: ExpoPushTicket, index: number) => {
        if (ticket.status === 'ok') {
          successCount++;
          return {
            success: true,
            messageId: ticket.id,
            token: validTokens[index],
          };
        } else {
          failureCount++;
          return {
            success: false,
            error: ticket.message || 'Unknown error',
            token: validTokens[index],
          };
        }
      });

      return {
        successCount,
        failureCount,
        responses,
      };
    } catch (error: any) {
      console.error('Expo multicast error:', error);
      return {
        successCount: 0,
        failureCount: deviceTokens.length,
        responses: deviceTokens.map(token => ({
          success: false,
          error: error.message || 'Unknown error',
          token,
        })),
      };
    }
  }

  /**
   * Validate if token is an Expo Push Token
   */
  private isExpoPushToken(token: string): boolean {
    // Expo Push Tokens start with ExponentPushToken[ or ExpoPushToken[
    return /^Expo(nent)?PushToken\[.+\]$/.test(token);
  }
}

export default new ExpoProvider();

