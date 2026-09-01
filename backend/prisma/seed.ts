import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const seedData = [
  {
    githubRepo: 'expressjs/express',
    totalContributors: 1248,
    firstTimeContributors: 320,
    returningContributors: 96,
    retentionRate: 30.0,
    predictions: [
      {
        author: 'devUser01',
        mergeTimeHours: 36.5,
        willReturn: true,
        probability: 0.82
      },
      {
        author: 'coder_newb',
        mergeTimeHours: 120.0,
        willReturn: false,
        probability: 0.15
      }
    ]
  },
  {
    githubRepo: 'kalviumcommunity/S70_Team02_CRATE',
    totalContributors: 450,
    firstTimeContributors: 110,
    returningContributors: 42,
    retentionRate: 38.2,
    predictions: [
      {
        author: 'alex_dev',
        mergeTimeHours: 18.0,
        willReturn: true,
        probability: 0.91
      },
      {
        author: 'sam_contributor',
        mergeTimeHours: 72.5,
        willReturn: false,
        probability: 0.38
      }
    ]
  },
  {
    githubRepo: 'facebook/react',
    totalContributors: 1650,
    firstTimeContributors: 410,
    returningContributors: 145,
    retentionRate: 35.4,
    predictions: [
      {
        author: 'react_fan',
        mergeTimeHours: 24.0,
        willReturn: true,
        probability: 0.88
      }
    ]
  },
  {
    githubRepo: 'CRATE-Core-Repo',
    totalContributors: 1248,
    firstTimeContributors: 320,
    returningContributors: 96,
    retentionRate: 30.0,
    predictions: [
      {
        author: 'devUser01',
        mergeTimeHours: 36.5,
        willReturn: true,
        probability: 0.82
      },
      {
        author: 'coder_newb',
        mergeTimeHours: 120.0,
        willReturn: false,
        probability: 0.15
      }
    ]
  }
];

async function main() {
  console.log('[SEED] Starting database seed...');
  
  try {
    for (const repoData of seedData) {
      const existing = await prisma.repository.findUnique({
        where: { githubRepo: repoData.githubRepo }
      });

      if (existing) {
        console.log(`[SEED] Updating existing repository: ${repoData.githubRepo}`);
        await prisma.repository.update({
          where: { id: existing.id },
          data: {
            totalContributors: repoData.totalContributors,
            firstTimeContributors: repoData.firstTimeContributors,
            returningContributors: repoData.returningContributors,
            retentionRate: repoData.retentionRate
          }
        });
      } else {
        console.log(`[SEED] Creating repository: ${repoData.githubRepo}`);
        await prisma.repository.create({
          data: {
            githubRepo: repoData.githubRepo,
            totalContributors: repoData.totalContributors,
            firstTimeContributors: repoData.firstTimeContributors,
            returningContributors: repoData.returningContributors,
            retentionRate: repoData.retentionRate,
            predictions: {
              create: repoData.predictions
            }
          }
        });
      }
    }
    console.log('[SEED] Database seeding complete successfully.');
  } catch (error) {
    console.error('[SEED] Warning: Seeding encountered database connection issue:', (error as Error).message);
    console.log('[SEED] Backend will operate using runtime cache / fallback mock data if PostgreSQL is not connected.');
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}
