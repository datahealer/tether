import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Tether API',
    version: '1.0.0',
    description: 'API documentation for Tether backend',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'User ID',
          },
          email: {
            type: 'string',
            format: 'email',
          },
          name: {
            type: 'string',
          },
          provider: {
            type: 'string',
            enum: ['google', 'apple', 'email'],
          },
          platform: {
            type: 'string',
            enum: ['ios', 'android', 'web'],
          },
          avatar: {
            type: 'string',
            nullable: true,
          },
          onboarded: {
            type: 'boolean',
          },
          subscribed: {
            type: 'boolean',
          },
          onboardingData: {
            $ref: '#/components/schemas/OnboardingData',
          },
          coupleId: {
            type: 'string',
            nullable: true,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      OnboardingData: {
        type: 'object',
        properties: {
          firstName: {
            type: 'string',
          },
          partnerFirstName: {
            type: 'string',
          },
          dateOfBirth: {
            type: 'string',
          },
          gender: {
            type: 'string',
          },
          relationshipStatus: {
            type: 'string',
            enum: ['single', 'dating', 'engaged', 'married', 'its-complicated'],
          },
          relationshipDuration: {
            type: 'string',
          },
          livingType: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          hasChildren: {
            type: 'boolean',
          },
          goals: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          emotionalNeeds: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          rhythm: {
            type: 'string',
            enum: ['Every day', 'A few times a week', 'Once a week', "We'll decide as we go"],
          },
          tone: {
            type: 'string',
            enum: ['playful', 'reflective', 'romantic', 'deep'],
          },
          packPreferences: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
          },
          accessToken: {
            type: 'string',
          },
          refreshToken: {
            type: 'string',
          },
          user: {
            $ref: '#/components/schemas/User',
          },
        },
      },
      Couple: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          user1Id: {
            type: 'string',
          },
          user2Id: {
            type: 'string',
          },
          status: {
            type: 'string',
            enum: ['active', 'paused', 'ended'],
          },
          sharedData: {
            type: 'object',
            properties: {
              currentStreak: {
                type: 'number',
              },
              totalTethersCompleted: {
                type: 'number',
              },
              lastTetherDate: {
                type: 'string',
                format: 'date-time',
                nullable: true,
              },
            },
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      CoupleInvite: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          inviterId: {
            type: 'string',
          },
          inviteCode: {
            type: 'string',
          },
          status: {
            type: 'string',
            enum: ['pending', 'accepted', 'expired'],
          },
          expiresAt: {
            type: 'string',
            format: 'date-time',
          },
          acceptedById: {
            type: 'string',
            nullable: true,
          },
          acceptedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Question: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          questionId: {
            type: 'string',
          },
          question: {
            type: 'string',
          },
          tone: {
            type: 'string',
            enum: ['playful', 'reflective', 'romantic', 'deep'],
          },
          genderFocus: {
            type: 'string',
            enum: ['Male', 'Female', 'Neutral'],
          },
          relationshipStage: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['Early', 'Established', 'Long-term', 'Rebuilding'],
            },
          },
          livingType: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['Together', 'Apart, Long Distance', 'Kids', 'No Kids'],
            },
          },
          goalTag: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          emotionalNeed: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          categoryId: {
            type: 'string',
            enum: ['communication', 'intimacy', 'playfulness', 'trust', 'love_languages', 'future', 'vulnerability', 'conflict', 'erotic', 'gratitude'],
          },
          formatType: {
            type: 'string',
            nullable: true,
          },
          contextTag: {
            type: 'string',
            nullable: true,
          },
          difficulty: {
            type: 'number',
            minimum: 1,
            maximum: 5,
          },
          status: {
            type: 'string',
            enum: ['Draft', 'Published'],
          },
          writerNotes: {
            type: 'string',
            nullable: true,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Tether: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          coupleId: {
            type: 'string',
          },
          questionId: {
            type: 'string',
          },
          question: {
            $ref: '#/components/schemas/Question',
          },
          status: {
            type: 'string',
            enum: ['active', 'waiting_for_partner', 'both_answered', 'expired', 'skipped', 'refreshed', 'unanswered_expired'],
          },
          droppedAt: {
            type: 'string',
            format: 'date-time',
          },
          expiresAt: {
            type: 'string',
            format: 'date-time',
          },
          answers: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                userId: {
                  type: 'string',
                },
                answer: {
                  type: 'string',
                },
                answeredAt: {
                  type: 'string',
                  format: 'date-time',
                },
              },
            },
          },
          skippedBy: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          refreshed: {
            type: 'boolean',
          },
          firstResponderUserId: {
            type: 'string',
            nullable: true,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Subscription: {
        type: 'object',
        properties: {
          subscribed: {
            type: 'boolean',
          },
          subscriptionTier: {
            type: 'string',
            enum: ['free', 'trial', 'premium'],
          },
          trialEndsAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
          premiumExpiresAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
        },
      },
      Profile: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          email: {
            type: 'string',
            format: 'email',
          },
          name: {
            type: 'string',
          },
          avatar: {
            type: 'string',
            nullable: true,
          },
          provider: {
            type: 'string',
            enum: ['google', 'apple', 'email'],
          },
          platform: {
            type: 'string',
            enum: ['ios', 'android', 'web'],
          },
          onboarded: {
            type: 'boolean',
          },
          subscribed: {
            type: 'boolean',
          },
          coupleId: {
            type: 'string',
            nullable: true,
          },
          notificationPreferences: {
            type: 'object',
            properties: {
              gentleReminders: {
                type: 'boolean',
              },
              milestoneAlerts: {
                type: 'boolean',
              },
              newTetherAlerts: {
                type: 'boolean',
              },
            },
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
          },
          message: {
            type: 'string',
          },
          success: {
            type: 'boolean',
            example: false,
          },
        },
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
          },
        },
      },
      LogEntry: {
        type: 'object',
        properties: {
          timestamp: {
            type: 'string',
            format: 'date-time',
          },
          method: {
            type: 'string',
            enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
          },
          url: {
            type: 'string',
          },
          statusCode: {
            type: 'number',
            nullable: true,
          },
          responseTime: {
            type: 'number',
            nullable: true,
          },
          ip: {
            type: 'string',
            nullable: true,
          },
          userAgent: {
            type: 'string',
            nullable: true,
          },
        },
      },
      LogsResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
          },
          count: {
            type: 'number',
          },
          logs: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/LogEntry',
            },
          },
        },
      },
      Notification: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          userId: {
            type: 'string',
          },
          coupleId: {
            type: 'string',
            nullable: true,
          },
          tetherId: {
            type: 'string',
            nullable: true,
          },
          type: {
            type: 'string',
            enum: ['new_tether', 'partner_answered', 'question_expiring', 'gentle_reminder', 'milestone', 'both_answered', 'couple_invite', 'system'],
          },
          title: {
            type: 'string',
          },
          body: {
            type: 'string',
          },
          data: {
            type: 'object',
            additionalProperties: true,
          },
          status: {
            type: 'string',
            enum: ['pending', 'sent', 'failed', 'delivered', 'read'],
          },
          platform: {
            type: 'string',
            enum: ['ios', 'android', 'web'],
          },
          scheduledFor: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
          sentAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
          deliveredAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
          readAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      RevenueCatUser: {
        type: 'object',
        properties: {
          request_id: {
            type: 'string',
          },
          subscriber: {
            type: 'object',
            properties: {
              entitlements: {
                type: 'object',
                additionalProperties: true,
              },
              subscriptions: {
                type: 'object',
                additionalProperties: true,
              },
              first_seen: {
                type: 'string',
                format: 'date-time',
              },
              last_seen: {
                type: 'string',
                format: 'date-time',
              },
              original_app_user_id: {
                type: 'string',
              },
            },
          },
        },
      },
    },
  },
};

const options = {
  definition: swaggerDefinition,
  apis: ['./src/routes/**/*.ts', './src/controllers/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
