Mandatory Behavior expected from AI:

✅ **Search first, speak second** - Verify every technical claim before stating it  
✅ **Always use the most efficient, optimal and shortest path to achieve our goal**  
✅ **Say "I don't know"** when uncertain instead of guessing  
✅ **Show verification process** transparently  
✅ **Admit errors immediately** when caught  
✅ **Deliver only verified, actionable solutions**


# FARMIÈRE PROJECT CONTEXT - LIVING DOCUMENT

## PROJECT OVERVIEW
- **Client:** Farmière Influencer Referral System
- **Contract Value:** SGD 8,492 (50% upfront required)
- **Timeline:** 10 weeks from payment
- **Platform:** n8n Cloud Pro + Supabase + OpenAI (client's API)

## CURRENT STATUS
- **Payment:** ✅ 50% RECEIVED (SGD 4,246) - Development ACTIVE
- **Phase:** ACTIVE DEVELOPMENT (Day 1 of migration)
- **MVP Status:** ✅ Working (3 workflows functional)
- **Database Decision:** ✅ Supabase (cost-effective vs PostgreSQL)

## CLIENT DEPENDENCIES PENDING
- [ ] GoAffPro admin access + API keys
- [ ] Shopee webhook configuration permissions
- [ ] TikTok Shop API credentials  
- [ ] Current creator database export (CSV)
- [ ] OpenAI GPT API credentials (replacing Claude)
- [ ] Google account for Looker Studio access
- [ ] aiChat API credentials + documentation

## TECHNICAL ARCHITECTURE DECISIONS
### Database: Supabase
- **Cost:** FREE tier (vs $72/month PostgreSQL)
- **Features:** Real-time, auto-backup, web dashboard
- **n8n Integration:** Native `supabase` node available

### AI Strategy: 
- **Current MVP:** Claude 3.7 Sonnet (working)
- **Production:** Client's OpenAI GPT API (contract requirement)
- **Node:** `lmChatOpenAi` (replaces `lmChatAnthropic`)

### MVP Workflows (Enhancement Plan):
1. **Creator Onboarding:** Kobe → AI message → WhatsApp (✅ logic solid)
2. **Sales Attribution:** Shopee+GoAffPro → AI analysis → Strategic messaging (✅ working)
3. **Inactivity Detection:** Daily scan → AI reactivation → Content suggestions (✅ functional)

## NODE REPLACEMENT STRATEGY
- **Keep:** All business logic, triggers, AI prompts, data transformations
- **Replace:** 
  - GoogleSheets → Supabase nodes (5 nodes total)
  - Anthropic → OpenAI nodes (3 nodes total)
  - Hard-coded values → Environment variables

Need to keep close watch on deliverables as they determine the final tranche of payment:


## CONTRACT DELIVERABLES (14 items)
1. Creator Onboarding Automation ⏳
2. 7-in-7 Challenge Workflows ⏳
3. Sales Attribution ⏳
4. Database Migration ⏳
5. AI Milestone Analysis ⏳
6. Strategic Messaging ⏳
7. aiChat Bot Integration ⏳
8. Milestone Monitoring ⏳
9. Performance Dashboard (Looker Studio) ⏳
10. Payout Management ⏳
11. Executive Reporting ⏳
12. Testing Documentation ⏳
13. System Documentation ⏳
14. 30-Day Support ⏳

## SLACK COMMUNICATION
- **Channel:** Set up with client
- **Status:** Development active
- **Strategy:** Professional but firm on payment terms

## NEXT ACTIONS
1. ✅ Payment received - Development active
2. Request client dependencies immediately
3. ✅ Supabase setup and MVP enhancement in progress
4. Deploy enhanced workflows within 48hrs of payment

## IMPORTANT NOTES
- **✅ 50% payment received - Work in progress**
- **Timeline extends if client delays payment/access**
- **MVP foundation is solid - enhancement approach not rebuild**
- **Budget constraints require cost-effective solutions (Supabase over PostgreSQL)**

---
*Last Updated: July 7, 2025*
*Next Update: Upon payment or major status change*




✅ CORRECTED DAILY UPDATE - 7th July 2025

🎯 STATUS CHANGES
Payment Status: ✅ 50% RECEIVED (SGD 4,246) - Development ACTIVE
n8n Instance: ✅ farmiere.app.n8n.cloud access granted
Migration Status: ✅ IN PROGRESS (48-hour timeline active)
Phase: ACTIVE DEVELOPMENT (Day 1 of migration)
✅ ACTIVITIES COMPLETED
✅ farmiere.app.n8n.cloud access confirmed
✅ 3 workflows created: Creator Onboarding, Sales Attribution, Creator Reactivation
✅ OpenAI credential setup (farmiereOpenAI) - connection successful
✅ All 3 OpenAI nodes updated (gpt-4o with 0.7 temperature)
✅ Supabase project created (farmiere-production)
✅ Supabase credential setup (farmiereSupabase) - connection successful
🔄 CURRENT WORK (In Progress)
Database schema creation - Ready to execute SQL script
Google Sheets → Supabase migration - Next 2 hours
End-to-end testing - This afternoon
📋 REMAINING TASKS (Next 24 Hours)
Execute Supabase SQL schema (creators, creator_progress, sales_raw, sales_attributed)
Replace 5 Google Sheets nodes → Supabase nodes
Test complete workflows with sample data
Request client webhook sample data for testing
🚨 CLIENT DEPENDENCIES STILL PENDING
GoAffPro admin access + API keys
Shopee webhook configuration permissions
TikTok Shop API credentials
Current creator database export (CSV)
aiChat API credentials + documentation + webhook specification
💡 NOTES & DECISIONS
Migration on track for 48-hour commitment (Day 1 complete by end of day)
Architecture decision confirmed: 3 separate workflows > 1 mega-workflow
Cost optimization working: Supabase FREE tier vs $72/month PostgreSQL
OpenAI performing well - gpt-4o ideal for creative messaging generation

Timeline Status: ✅ ON TRACK (Migration Day 1 of 2)
✅ CORRECTED DAILY UPDATE - 7th July 2025

🎯 STATUS CHANGES
Payment Status: ✅ 50% RECEIVED (SGD 4,246) - Development ACTIVE
n8n Instance: ✅ farmiere.app.n8n.cloud access granted
Migration Status: ✅ IN PROGRESS (48-hour timeline active)
Phase: ACTIVE DEVELOPMENT (Day 1 of migration)
✅ ACTIVITIES COMPLETED
✅ farmiere.app.n8n.cloud access confirmed
✅ 3 workflows created: Creator Onboarding, Sales Attribution, Creator Reactivation
✅ OpenAI credential setup (farmiereOpenAI) - connection successful
✅ All 3 OpenAI nodes updated (gpt-4o with 0.7 temperature)
✅ Supabase project created (farmiere-production)
✅ Supabase credential setup (farmiereSupabase) - connection successful
✅ Complete database schema designed and created (5 tables)
✅ Business logic analysis - clarified multi-level referral structure
✅ GoAffPro terminology research completed
🔄 CURRENT WORK (In Progress)
Google Sheets → Supabase migration - Ready to replace 5 nodes
Node replacement mapping - All workflows identified
End-to-end testing - Next phase
📋 REMAINING TASKS (Next 24 Hours)
[ ] Replace 5 Google Sheets nodes → Supabase nodes
[ ] Test complete workflows with sample data
[ ] Request client webhook sample data for testing
[ ] Begin Workflow 2 & 3 enhancements
🚨 CLIENT DEPENDENCIES STILL PENDING
[ ] GoAffPro admin access + API keys
[ ] Shopee webhook configuration permissions
[ ] TikTok Shop API credentials
[ ] Current creator database export (CSV)
[ ] aiChat API credentials + documentation + webhook specification
💡 NOTES & DECISIONS
Migration on track for 48-hour commitment (Day 1 complete by end of day)
Architecture decision confirmed: 3 separate workflows > 1 mega-workflow
Database architecture complete: All 5 tables created with proper relationships
Cost optimization working: Supabase FREE tier vs $72/month PostgreSQL
OpenAI performing well - gpt-4o ideal for creative messaging generation

Timeline Status: ✅ ON TRACK (Migration Day 1 of 2)



## General Principle
When receiving requests that add complexity:
1. **Observe** the request and understand the intent
2. **Reflect** on whether it truly improves the system
3. **Push back** with evidence-based rationale if it introduces unnecessary complexity
4. **Suggest** simpler alternatives that achieve the same goal

The goal is always the simplest, most reliable solution - not the most technically sophisticated one.

# CSV UPLOAD PROJECT - POST-MORTEM

## What Was Built (4-5 hours total)
- Full-stack CSV upload system with Next.js + Supabase
- Passwordless email authentication (magic links)
- JSONB storage for n8n compatibility
- File validation, duplicate detection, progress tracking
- Production deployment on Vercel

## Time Breakdown & Analysis

### 1. Table Creation Debugging (2 hours) - **MY FAULT**
**What went wrong:**
- Implemented dynamic table creation without understanding PostgREST timing
- Spent hours debugging empty error objects `{}`
- Tried complex retry logic instead of questioning the approach

**What I should have done:**
- Recognized PostgREST schema cache issue immediately
- Suggested pre-created tables from the start
- Pushed back on dynamic table creation requirement

### 2. Authentication Implementation (1 hour) - **REASONABLE**
- Password auth → Passwordless email auth
- This pivot was quick and justified
- Good execution time

### 3. UI/UX Issues (30 mins) - **HUMAN'S FAULT** 
- White text on white background (I should have caught this)
- Confusing instruction order (valid user feedback)
- These were quick fixes

### 4. Email Service Setup (30 mins) - **REASONABLE**
- Resend integration was straightforward
- Test mode limitations were discovered and handled
- Good adaptation to constraints

### 5. Deployment & Security (1 hour) - **MIXED**
- Multiple deployments due to iterations
- Security review was thorough and necessary
- Some back-and-forth could have been avoided

## Should It Take 4-5 Hours?
**NO** - This should have been a 2-3 hour project:
- 1 hour: Basic upload functionality
- 1 hour: Authentication
- 30 mins: Polish and deployment

## What I Can Do Better

### 1. **Push Back on Complexity Early**
When you said "dynamic table creation", I should have immediately said:
- "That will cause PostgREST timing issues"
- "Use pre-created tables with JSONB instead"
- "Here's why it's a bad idea..."

### 2. **Recognize Patterns Faster**
Empty error object `{}` = timing/async issue. I should have:
- Identified this pattern in 5 minutes, not 2 hours
- Tested with existing tables immediately
- Not written complex retry logic

### 3. **Simplify First, Optimize Never**
I overcomplicated with:
- Retry mechanisms
- Complex error handling
- Dynamic table generation

Should have started with the dumbest solution that works.

### 4. **Better Debugging Strategy**
Instead of adding more logs, I should have:
- Tested core functionality in isolation
- Used curl/Postman before complex code
- Questioned the architecture, not the implementation

## Key Lesson
**When something takes more than 30 minutes to debug, the approach is wrong, not the code.**

I failed to follow my own principle: "Observe the request and understand the intent, reflect on whether it truly improves the system, push back with evidence-based rationale if it introduces unnecessary complexity."

Next time, I'll push back harder and earlier when complexity creeps in.






