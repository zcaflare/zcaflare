import { z } from 'zod'

/**
 * Shared Zod pieces for the per-method Zalo action schemas. These mirror the
 * `zca-js` argument types so every `actions/<method>.ts` schema composes from
 * one source of truth. Enum values are inlined as literals (not imported from
 * `zca-js`) so this module stays free of a `zca-js` runtime dependency and is
 * safe to import from client code.
 *
 * `AttachmentSource` is modelled as a plain URL/path string only: `zca-js` also
 * accepts an in-memory `{ data: Buffer, ... }` form, but a Node Buffer cannot
 * cross the JSON action proxy, so binary uploads are out of scope here.
 */

// --- enums (numeric/string literal unions) ---------------------------------

/** ThreadType: 0 = User, 1 = Group. */
export const ThreadTypeSchema = z.union([z.literal(0), z.literal(1)])
/** DestType: 1 = Group, 3 = User, 5 = Page. */
export const DestTypeSchema = z.union([z.literal(1), z.literal(3), z.literal(5)])
/** AvatarSize: 120 = Small, 240 = Large. */
export const AvatarSizeSchema = z.union([z.literal(120), z.literal(240)])
/** Gender: 0 = Male, 1 = Female. */
export const GenderSchema = z.union([z.literal(0), z.literal(1)])
/** ChatTTL in ms: 0 = off, 1 day, 7 days, 14 days. */
export const ChatTTLSchema = z.union([
  z.literal(0),
  z.literal(86_400_000),
  z.literal(604_800_000),
  z.literal(1_209_600_000),
])
/** AutoReplyScope: 0 = Everyone, 1 = Stranger, 2 = SpecificFriends, 3 = FriendsExcept. */
export const AutoReplyScopeSchema = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)])
/** ReminderRepeatMode: 0 = None, 1 = Daily, 2 = Weekly, 3 = Monthly. */
export const ReminderRepeatModeSchema = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)])

export const UpdateLangAvailableLanguagesSchema = z.enum(['VI', 'EN'])

export const UpdateSettingsTypeSchema = z.enum([
  'view_birthday',
  'show_online_status',
  'display_seen_status',
  'receive_message',
  'accept_stranger_call',
  'add_friend_via_phone',
  'add_friend_via_qr',
  'add_friend_via_group',
  'add_friend_via_contact',
  'display_on_recommend_friend',
  'archivedChatStatus',
  'quickMessageStatus',
])

/** Reaction icon codes (`Reactions` enum values). "" clears the reaction. */
export const ReactionsSchema = z.enum([
  '/-heart',
  '/-strong',
  ':>',
  ':o',
  ':-((',
  ':-h',
  ':-*',
  ':\')',
  '/-shit',
  '/-rose',
  '/-break',
  '/-weak',
  ';xx',
  ';-/',
  ';-)',
  '/-fade',
  '/-li',
  '/-bd',
  '/-bome',
  '/-ok',
  '/-v',
  '/-thanks',
  '/-punch',
  '/-share',
  '_()_',
  '/-no',
  '/-bad',
  '/-loveu',
  '--b',
  ':((',
  'x-)',
  '8-)',
  ';-d',
  'b-)',
  ':--|',
  'p-(',
  ':-bye',
  '|-)',
  ':wipe',
  ':-dig',
  '&-(',
  ':handclap',
  '>-|',
  ':-f',
  ':-l',
  ':-r',
  ';-x',
  ':-o',
  ';-s',
  ';-a',
  ':-<',
  ':))',
  '$-)',
  '/-beer',
  '',
])

// --- reusable building blocks ----------------------------------------------

/** A file path or public URL. The in-memory Buffer form is not JSON-transportable. */
export const AttachmentSourceSchema = z.string()

export const CustomReactionSchema = z.object({
  rType: z.number(),
  source: z.number(),
  icon: z.string(),
})

export const MessageContentSchema = z.object({
  msg: z.string(),
  styles: z
    .array(z.object({
      start: z.number(),
      len: z.number(),
      st: z.string(),
      indentSize: z.number().optional(),
    }))
    .optional(),
  urgency: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(),
  quote: z.record(z.string(), z.unknown()).optional(),
  mentions: z.array(z.object({ pos: z.number(), uid: z.string(), len: z.number() })).optional(),
  attachments: z.union([AttachmentSourceSchema, z.array(AttachmentSourceSchema)]).optional(),
  ttl: z.number().optional(),
})

export const AddReactionDestinationSchema = z.object({
  data: z.object({ msgId: z.string(), cliMsgId: z.string() }),
  threadId: z.string(),
  type: ThreadTypeSchema,
})

// --- create / edit options -------------------------------------------------

export const CreateGroupOptionsSchema = z.object({
  name: z.string().optional(),
  members: z.array(z.string()),
  avatarSource: AttachmentSourceSchema.optional(),
  avatarPath: z.string().optional(),
})

export const CreateNoteOptionsSchema = z.object({
  title: z.string(),
  pinAct: z.boolean().optional(),
})

export const EditNoteOptionsSchema = z.object({
  title: z.string(),
  topicId: z.string(),
  pinAct: z.boolean().optional(),
})

export const CreatePollOptionsSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
  expiredTime: z.number().optional(),
  allowMultiChoices: z.boolean().optional(),
  allowAddNewOption: z.boolean().optional(),
  hideVotePreview: z.boolean().optional(),
  isAnonymous: z.boolean().optional(),
})

export const CreateReminderOptionsSchema = z.object({
  title: z.string(),
  emoji: z.string().optional(),
  startTime: z.number().optional(),
  repeat: ReminderRepeatModeSchema.optional(),
})

export const EditReminderOptionsSchema = z.object({
  title: z.string(),
  topicId: z.string(),
  emoji: z.string().optional(),
  startTime: z.number().optional(),
  repeat: ReminderRepeatModeSchema.optional(),
})

// --- send options / payloads -----------------------------------------------

export const SendCardOptionsSchema = z.object({
  userId: z.string(),
  phoneNumber: z.string().optional(),
  ttl: z.number().optional(),
})

export const SendLinkOptionsSchema = z.object({
  msg: z.string().optional(),
  link: z.string(),
  ttl: z.number().optional(),
})

export const SendVideoOptionsSchema = z.object({
  msg: z.string().optional(),
  videoUrl: z.string(),
  thumbnailUrl: z.string(),
  duration: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  ttl: z.number().optional(),
})

export const SendVoiceOptionsSchema = z.object({
  voiceUrl: z.string(),
  ttl: z.number().optional(),
})

/** ReportReason: 0 = Other (needs content), 1 = Sensitive, 2 = Annoy, 3 = Fraud. */
export const SendReportOptionsSchema = z.union([
  z.object({ reason: z.literal(0), content: z.string() }),
  z.object({ reason: z.union([z.literal(1), z.literal(2), z.literal(3)]) }),
])

export const SendBankCardPayloadSchema = z.object({
  binBank: z.number(),
  numAccBank: z.string(),
  nameAccBank: z.string().optional(),
})

export const SendStickerPayloadSchema = z.object({
  id: z.number(),
  cateId: z.number(),
  type: z.number(),
})

export const ForwardMessagePayloadSchema = z.object({
  message: z.string(),
  ttl: z.number().optional(),
  reference: z
    .object({
      id: z.string(),
      ts: z.number(),
      logSrcType: z.number(),
      fwLvl: z.number(),
    })
    .optional(),
})

export const UndoPayloadSchema = z.object({
  msgId: z.union([z.string(), z.number()]),
  cliMsgId: z.union([z.string(), z.number()]),
})

export const DeleteChatLastMessageSchema = z.object({
  ownerId: z.string(),
  cliMsgId: z.string(),
  globalMsgId: z.string(),
})

export const DeleteMessageDestinationSchema = z.object({
  data: z.object({ cliMsgId: z.string(), msgId: z.string(), uidFrom: z.string() }),
  threadId: z.string(),
  type: ThreadTypeSchema.optional(),
})

/** SetMuteParams. duration: seconds, or "until8AM"; action: 1 = mute, 3 = unmute. */
export const SetMuteParamsSchema = z.object({
  duration: z.union([z.number(), z.literal('until8AM')]).optional(),
  action: z.union([z.literal(1), z.literal(3)]).optional(),
})

const EventMessageParamsShape = {
  msgId: z.string(),
  cliMsgId: z.string(),
  uidFrom: z.string(),
  idTo: z.string(),
  msgType: z.string(),
  st: z.number(),
  at: z.number(),
  cmd: z.number(),
  ts: z.union([z.string(), z.number()]),
}
export const SendDeliveredEventMessageParamsSchema = z.object(EventMessageParamsShape)
export const SendSeenEventMessageParamsSchema = z.object(EventMessageParamsShape)

export const UpdateArchivedChatListTargetSchema = z.object({
  id: z.string(),
  type: ThreadTypeSchema,
})

// --- poll / auto-reply / quick-message -------------------------------------

export const AddPollOptionsPayloadSchema = z.object({
  pollId: z.number(),
  options: z.array(z.object({ voted: z.boolean(), content: z.string() })),
  votedOptionIds: z.array(z.number()),
})

export const AddQuickMessagePayloadSchema = z.object({
  keyword: z.string(),
  title: z.string(),
  media: AttachmentSourceSchema.optional(),
})

export const UpdateQuickMessagePayloadSchema = AddQuickMessagePayloadSchema

const AutoReplyShape = {
  content: z.string(),
  isEnable: z.boolean(),
  startTime: z.number(),
  endTime: z.number(),
  scope: AutoReplyScopeSchema,
  uids: z.union([z.string(), z.array(z.string())]).optional(),
}
export const CreateAutoReplyPayloadSchema = z.object(AutoReplyShape)
export const UpdateAutoReplyPayloadSchema = z.object({ id: z.number(), ...AutoReplyShape })

export const ReviewPendingMemberRequestPayloadSchema = z.object({
  members: z.union([z.string(), z.array(z.string())]),
  isApprove: z.boolean(),
})

// --- pagination / lookup payloads ------------------------------------------

export const GetCatalogListPayloadSchema = z.object({
  limit: z.number().optional(),
  lastProductId: z.number().optional(),
  page: z.number().optional(),
})

export const GetGroupBlockedMemberPayloadSchema = z.object({
  page: z.number().optional(),
  count: z.number().optional(),
})

export const GetGroupInviteBoxInfoPayloadSchema = z.object({
  groupId: z.string(),
  mpage: z.number().optional(),
  mcount: z.number().optional(),
})

export const GetGroupInviteBoxListPayloadSchema = z.object({
  mpage: z.number().optional(),
  page: z.number().optional(),
  invPerPage: z.number().optional(),
  mcount: z.number().optional(),
})

export const GetGroupLinkInfoPayloadSchema = z.object({
  link: z.string(),
  memberPage: z.number().optional(),
})

export const ListBoardOptionsSchema = z.object({
  page: z.number().optional(),
  count: z.number().optional(),
})

export const ListReminderOptionsSchema = ListBoardOptionsSchema

export const GetProductCatalogListPayloadSchema = z.object({
  catalogId: z.string(),
  limit: z.number().optional(),
  versionCatalog: z.number().optional(),
  lastProductId: z.string().optional(),
  page: z.number().optional(),
})

// --- catalog / product / labels / profile ----------------------------------

export const CreateProductCatalogPayloadSchema = z.object({
  catalogId: z.string(),
  productName: z.string(),
  price: z.string(),
  description: z.string(),
  files: z.array(AttachmentSourceSchema).optional(),
  product_photos: z.array(z.string()).optional(),
})

export const UpdateProductCatalogPayloadSchema = z.object({
  catalogId: z.string(),
  productId: z.string(),
  productName: z.string(),
  price: z.string(),
  description: z.string(),
  createTime: z.number(),
  files: z.array(AttachmentSourceSchema).optional(),
  product_photos: z.array(z.string()).optional(),
})

export const DeleteProductCatalogPayloadSchema = z.object({
  productIds: z.union([z.string(), z.array(z.string())]),
  catalogId: z.string(),
})

export const UploadProductPhotoPayloadSchema = z.object({
  file: AttachmentSourceSchema,
})

export const UpdateCatalogPayloadSchema = z.object({
  catalogId: z.string(),
  catalogName: z.string(),
})

export const UpdateGroupSettingsOptionsSchema = z.object({
  blockName: z.boolean().optional(),
  signAdminMsg: z.boolean().optional(),
  setTopicOnly: z.boolean().optional(),
  enableMsgHistory: z.boolean().optional(),
  joinAppr: z.boolean().optional(),
  lockCreatePost: z.boolean().optional(),
  lockCreatePoll: z.boolean().optional(),
  lockSendMsg: z.boolean().optional(),
  lockViewMember: z.boolean().optional(),
})

export const UpdateLabelsPayloadSchema = z.object({
  labelData: z.array(z.record(z.string(), z.unknown())),
  version: z.number(),
})

export const UpdateProfilePayloadSchema = z.object({
  profile: z.object({
    name: z.string(),
    dob: z.string(),
    gender: GenderSchema,
  }),
  biz: z
    .object({
      cate: z.number().optional(),
      description: z.string().optional(),
      address: z.string().optional(),
      website: z.string().optional(),
      email: z.string().optional(),
    })
    .optional(),
})
