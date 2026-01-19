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
      Category: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          categoryId: {
            type: 'string',
            enum: ['communication', 'intimacy', 'playfulness', 'trust', 'love_languages', 'future', 'vulnerability', 'conflict', 'erotic', 'gratitude'],
          },
          name: {
            type: 'string',
          },
          totalQuestions: {
            type: 'number',
            default: 180,
          },
          colorCode: {
            type: 'string',
          },
          description: {
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
      CategoryProgress: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          coupleId: {
            type: 'string',
          },
          categoryId: {
            type: 'string',
            enum: ['communication', 'intimacy', 'playfulness', 'trust', 'love_languages', 'future', 'vulnerability', 'conflict', 'erotic', 'gratitude'],
          },
          answeredCount: {
            type: 'number',
            default: 0,
          },
          totalQuestions: {
            type: 'number',
            default: 18,
          },
          servedQuestionIds: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          lastServedAt: {
            type: 'string',
            format: 'date-time',
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
      CoupleCategoryState: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          coupleId: {
            type: 'string',
          },
          categoryId: {
            type: 'string',
          },
          answeredCount: {
            type: 'number',
            default: 0,
          },
          totalQuestions: {
            type: 'number',
            default: 180,
          },
          skippedCount: {
            type: 'number',
            default: 0,
          },
          isComplete: {
            type: 'boolean',
            default: false,
          },
          unlocked: {
            type: 'boolean',
            default: false,
          },
          unlockExpiry: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
          lastActivityAt: {
            type: 'string',
            format: 'date-time',
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
      Purchase: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          userId: {
            type: 'string',
          },
          planType: {
            type: 'string',
            enum: ['yearly', 'monthly', 'trial'],
          },
          amount: {
            type: 'number',
            minimum: 0,
          },
          currency: {
            type: 'string',
            default: 'USD',
          },
          status: {
            type: 'string',
            enum: ['active', 'expired', 'cancelled'],
          },
          startDate: {
            type: 'string',
            format: 'date-time',
          },
          expiresAt: {
            type: 'string',
            format: 'date-time',
          },
          autoRenew: {
            type: 'boolean',
            default: true,
          },
          purchaseToken: {
            type: 'string',
            nullable: true,
          },
          revenueCatTransactionId: {
            type: 'string',
            nullable: true,
          },
          revenueCatOriginalTransactionId: {
            type: 'string',
            nullable: true,
          },
          revenueCatProductId: {
            type: 'string',
            nullable: true,
          },
          revenueCatStore: {
            type: 'string',
            enum: ['app_store', 'play_store', 'stripe', 'promotional'],
            nullable: true,
          },
          cancelledAt: {
            type: 'string',
            format: 'date-time',
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
      CoupleStats: {
        type: 'object',
        properties: {
          totalAnswered: {
            type: 'number',
          },
          currentStreak: {
            type: 'number',
          },
          lastAnsweredDate: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
        },
      },
      TetherHistory: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
          },
          tethers: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Tether',
            },
          },
          total: {
            type: 'number',
          },
        },
      },
      Admin: {
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
      SubscriptionStats: {
        type: 'object',
        properties: {
          overview: {
            type: 'object',
            properties: {
              totalSubscriptions: {
                type: 'number',
              },
              activeSubscriptions: {
                type: 'number',
              },
              expiredSubscriptions: {
                type: 'number',
              },
              cancelledSubscriptions: {
                type: 'number',
              },
              totalUsers: {
                type: 'number',
              },
              subscribedUsers: {
                type: 'number',
              },
              subscriptionRate: {
                type: 'string',
              },
            },
          },
          byPlanType: {
            type: 'object',
            properties: {
              monthly: {
                type: 'number',
              },
              yearly: {
                type: 'number',
              },
              trial: {
                type: 'number',
              },
            },
          },
          revenue: {
            type: 'object',
            properties: {
              totalRevenue: {
                type: 'number',
              },
              monthlyRevenue: {
                type: 'number',
              },
              yearlyRevenue: {
                type: 'number',
              },
              mrr: {
                type: 'number',
                description: 'Monthly Recurring Revenue',
              },
              arr: {
                type: 'number',
                description: 'Annual Recurring Revenue',
              },
              avgMonthlyPrice: {
                type: 'number',
              },
              avgYearlyPrice: {
                type: 'number',
              },
            },
          },
          byStore: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                _id: {
                  type: 'string',
                  nullable: true,
                },
                count: {
                  type: 'number',
                },
                revenue: {
                  type: 'number',
                },
              },
            },
          },
        },
      },
      SubscriptionListResponse: {
        type: 'object',
        properties: {
          subscriptions: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Purchase',
            },
          },
          pagination: {
            type: 'object',
            properties: {
              page: {
                type: 'number',
              },
              limit: {
                type: 'number',
              },
              total: {
                type: 'number',
              },
              totalPages: {
                type: 'number',
              },
            },
          },
        },
      },
      SubscriptionTrends: {
        type: 'object',
        properties: {
          daily: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                _id: {
                  type: 'string',
                },
                count: {
                  type: 'number',
                },
                revenue: {
                  type: 'number',
                },
              },
            },
          },
          weekly: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                _id: {
                  type: 'object',
                  properties: {
                    year: {
                      type: 'number',
                    },
                    week: {
                      type: 'number',
                    },
                  },
                },
                count: {
                  type: 'number',
                },
                revenue: {
                  type: 'number',
                },
              },
            },
          },
          monthly: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                _id: {
                  type: 'object',
                  properties: {
                    year: {
                      type: 'number',
                    },
                    month: {
                      type: 'number',
                    },
                  },
                },
                count: {
                  type: 'number',
                },
                revenue: {
                  type: 'number',
                },
              },
            },
          },
          byPlanType: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                _id: {
                  type: 'string',
                  enum: ['monthly', 'yearly', 'trial'],
                },
                count: {
                  type: 'number',
                },
                revenue: {
                  type: 'number',
                },
              },
            },
          },
        },
      },
      ChurnAnalysis: {
        type: 'object',
        properties: {
          period: {
            type: 'string',
          },
          churned: {
            type: 'object',
            properties: {
              cancelled: {
                type: 'number',
              },
              expired: {
                type: 'number',
              },
              total: {
                type: 'number',
              },
            },
          },
          newSubscriptions: {
            type: 'number',
          },
          activeAtStart: {
            type: 'number',
          },
          churnRate: {
            type: 'number',
          },
          cancellationTiming: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                _id: {
                  type: 'string',
                },
                count: {
                  type: 'number',
                },
              },
            },
          },
        },
      },
      UserSubscriptionsResponse: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
              },
              email: {
                type: 'string',
              },
              name: {
                type: 'string',
              },
              platform: {
                type: 'string',
                enum: ['ios', 'android', 'web'],
              },
              subscribed: {
                type: 'boolean',
              },
            },
          },
          purchases: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Purchase',
            },
          },
          revenueCat: {
            $ref: '#/components/schemas/RevenueCatUser',
            nullable: true,
          },
        },
      },
      RevenueAnalytics: {
        type: 'object',
        properties: {
          period: {
            type: 'string',
          },
          groupBy: {
            type: 'string',
            enum: ['day', 'week', 'month'],
          },
          totalRevenue: {
            type: 'number',
          },
          byDate: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                _id: {
                  type: 'string',
                },
                revenue: {
                  type: 'number',
                },
                count: {
                  type: 'number',
                },
                monthlyRevenue: {
                  type: 'number',
                },
                yearlyRevenue: {
                  type: 'number',
                },
              },
            },
          },
          byPlan: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                _id: {
                  type: 'string',
                  enum: ['monthly', 'yearly'],
                },
                revenue: {
                  type: 'number',
                },
                count: {
                  type: 'number',
                },
                avgPrice: {
                  type: 'number',
                },
              },
            },
          },
          byStore: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                _id: {
                  type: 'string',
                  enum: ['app_store', 'play_store', 'stripe', 'promotional'],
                  nullable: true,
                },
                revenue: {
                  type: 'number',
                },
                count: {
                  type: 'number',
                },
              },
            },
          },
        },
      },
      SubscriptionHistoryResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
          },
          purchases: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Purchase',
            },
          },
          revenueCatUser: {
            $ref: '#/components/schemas/RevenueCatUser',
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
