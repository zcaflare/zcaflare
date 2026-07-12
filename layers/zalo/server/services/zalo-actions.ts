import type { z, ZodType } from 'zod'
import { AcceptFriendRequestSchema } from '#layers/zalo/shared/schemas/actions/acceptFriendRequest'
import { AddGroupBlockedMemberSchema } from '#layers/zalo/shared/schemas/actions/addGroupBlockedMember'
import { AddGroupDeputySchema } from '#layers/zalo/shared/schemas/actions/addGroupDeputy'
import { AddPollOptionsSchema } from '#layers/zalo/shared/schemas/actions/addPollOptions'
import { AddQuickMessageSchema } from '#layers/zalo/shared/schemas/actions/addQuickMessage'
import { AddReactionSchema } from '#layers/zalo/shared/schemas/actions/addReaction'
import { AddUnreadMarkSchema } from '#layers/zalo/shared/schemas/actions/addUnreadMark'
import { AddUserToGroupSchema } from '#layers/zalo/shared/schemas/actions/addUserToGroup'
import { BlockUserSchema } from '#layers/zalo/shared/schemas/actions/blockUser'
import { BlockViewFeedSchema } from '#layers/zalo/shared/schemas/actions/blockViewFeed'
import { ChangeAccountAvatarSchema } from '#layers/zalo/shared/schemas/actions/changeAccountAvatar'
import { ChangeFriendAliasSchema } from '#layers/zalo/shared/schemas/actions/changeFriendAlias'
import { ChangeGroupAvatarSchema } from '#layers/zalo/shared/schemas/actions/changeGroupAvatar'
import { ChangeGroupNameSchema } from '#layers/zalo/shared/schemas/actions/changeGroupName'
import { ChangeGroupOwnerSchema } from '#layers/zalo/shared/schemas/actions/changeGroupOwner'
import { CreateAutoReplySchema } from '#layers/zalo/shared/schemas/actions/createAutoReply'
import { CreateCatalogSchema } from '#layers/zalo/shared/schemas/actions/createCatalog'
import { CreateGroupSchema } from '#layers/zalo/shared/schemas/actions/createGroup'
import { CreateNoteSchema } from '#layers/zalo/shared/schemas/actions/createNote'
import { CreatePollSchema } from '#layers/zalo/shared/schemas/actions/createPoll'
import { CreateProductCatalogSchema } from '#layers/zalo/shared/schemas/actions/createProductCatalog'
import { CreateReminderSchema } from '#layers/zalo/shared/schemas/actions/createReminder'
import { DeleteAutoReplySchema } from '#layers/zalo/shared/schemas/actions/deleteAutoReply'
import { DeleteAvatarSchema } from '#layers/zalo/shared/schemas/actions/deleteAvatar'
import { DeleteCatalogSchema } from '#layers/zalo/shared/schemas/actions/deleteCatalog'
import { DeleteChatSchema } from '#layers/zalo/shared/schemas/actions/deleteChat'
import { DeleteGroupInviteBoxSchema } from '#layers/zalo/shared/schemas/actions/deleteGroupInviteBox'
import { DeleteMessageSchema } from '#layers/zalo/shared/schemas/actions/deleteMessage'
import { DeleteProductCatalogSchema } from '#layers/zalo/shared/schemas/actions/deleteProductCatalog'
import { DisableGroupLinkSchema } from '#layers/zalo/shared/schemas/actions/disableGroupLink'
import { DisperseGroupSchema } from '#layers/zalo/shared/schemas/actions/disperseGroup'
import { EditNoteSchema } from '#layers/zalo/shared/schemas/actions/editNote'
import { EditReminderSchema } from '#layers/zalo/shared/schemas/actions/editReminder'
import { EnableGroupLinkSchema } from '#layers/zalo/shared/schemas/actions/enableGroupLink'
import { FindUserSchema } from '#layers/zalo/shared/schemas/actions/findUser'
import { FindUserByUsernameSchema } from '#layers/zalo/shared/schemas/actions/findUserByUsername'
import { ForwardMessageSchema } from '#layers/zalo/shared/schemas/actions/forwardMessage'
import { GetAliasListSchema } from '#layers/zalo/shared/schemas/actions/getAliasList'
import { GetAllFriendsSchema } from '#layers/zalo/shared/schemas/actions/getAllFriends'
import { GetAvatarListSchema } from '#layers/zalo/shared/schemas/actions/getAvatarList'
import { GetAvatarUrlProfileSchema } from '#layers/zalo/shared/schemas/actions/getAvatarUrlProfile'
import { GetBizAccountSchema } from '#layers/zalo/shared/schemas/actions/getBizAccount'
import { GetCatalogListSchema } from '#layers/zalo/shared/schemas/actions/getCatalogList'
import { GetFriendBoardListSchema } from '#layers/zalo/shared/schemas/actions/getFriendBoardList'
import { GetFriendRequestStatusSchema } from '#layers/zalo/shared/schemas/actions/getFriendRequestStatus'
import { GetFullAvatarSchema } from '#layers/zalo/shared/schemas/actions/getFullAvatar'
import { GetGroupBlockedMemberSchema } from '#layers/zalo/shared/schemas/actions/getGroupBlockedMember'
import { GetGroupChatHistorySchema } from '#layers/zalo/shared/schemas/actions/getGroupChatHistory'
import { GetGroupInfoSchema } from '#layers/zalo/shared/schemas/actions/getGroupInfo'
import { GetGroupInviteBoxInfoSchema } from '#layers/zalo/shared/schemas/actions/getGroupInviteBoxInfo'
import { GetGroupInviteBoxListSchema } from '#layers/zalo/shared/schemas/actions/getGroupInviteBoxList'
import { GetGroupLinkDetailSchema } from '#layers/zalo/shared/schemas/actions/getGroupLinkDetail'
import { GetGroupLinkInfoSchema } from '#layers/zalo/shared/schemas/actions/getGroupLinkInfo'
import { GetGroupMembersInfoSchema } from '#layers/zalo/shared/schemas/actions/getGroupMembersInfo'
import { GetListBoardSchema } from '#layers/zalo/shared/schemas/actions/getListBoard'
import { GetListReminderSchema } from '#layers/zalo/shared/schemas/actions/getListReminder'
import { GetMultiUsersByPhonesSchema } from '#layers/zalo/shared/schemas/actions/getMultiUsersByPhones'
import { GetPendingGroupMembersSchema } from '#layers/zalo/shared/schemas/actions/getPendingGroupMembers'
import { GetPollDetailSchema } from '#layers/zalo/shared/schemas/actions/getPollDetail'
import { GetProductCatalogListSchema } from '#layers/zalo/shared/schemas/actions/getProductCatalogList'
import { GetQRSchema } from '#layers/zalo/shared/schemas/actions/getQR'
import { GetRelatedFriendGroupSchema } from '#layers/zalo/shared/schemas/actions/getRelatedFriendGroup'
import { GetReminderSchema } from '#layers/zalo/shared/schemas/actions/getReminder'
import { GetReminderResponsesSchema } from '#layers/zalo/shared/schemas/actions/getReminderResponses'
import { GetStickerCategoryDetailSchema } from '#layers/zalo/shared/schemas/actions/getStickerCategoryDetail'
import { GetStickersSchema } from '#layers/zalo/shared/schemas/actions/getStickers'
import { GetStickersDetailSchema } from '#layers/zalo/shared/schemas/actions/getStickersDetail'
import { GetUserInfoSchema } from '#layers/zalo/shared/schemas/actions/getUserInfo'
import { InviteUserToGroupsSchema } from '#layers/zalo/shared/schemas/actions/inviteUserToGroups'
import { JoinGroupInviteBoxSchema } from '#layers/zalo/shared/schemas/actions/joinGroupInviteBox'
import { JoinGroupLinkSchema } from '#layers/zalo/shared/schemas/actions/joinGroupLink'
import { LastOnlineSchema } from '#layers/zalo/shared/schemas/actions/lastOnline'
import { LeaveGroupSchema } from '#layers/zalo/shared/schemas/actions/leaveGroup'
import { LockPollSchema } from '#layers/zalo/shared/schemas/actions/lockPoll'
import { ParseLinkSchema } from '#layers/zalo/shared/schemas/actions/parseLink'
import { RejectFriendRequestSchema } from '#layers/zalo/shared/schemas/actions/rejectFriendRequest'
import { RemoveFriendSchema } from '#layers/zalo/shared/schemas/actions/removeFriend'
import { RemoveFriendAliasSchema } from '#layers/zalo/shared/schemas/actions/removeFriendAlias'
import { RemoveGroupBlockedMemberSchema } from '#layers/zalo/shared/schemas/actions/removeGroupBlockedMember'
import { RemoveGroupDeputySchema } from '#layers/zalo/shared/schemas/actions/removeGroupDeputy'
import { RemoveQuickMessageSchema } from '#layers/zalo/shared/schemas/actions/removeQuickMessage'
import { RemoveReminderSchema } from '#layers/zalo/shared/schemas/actions/removeReminder'
import { RemoveUnreadMarkSchema } from '#layers/zalo/shared/schemas/actions/removeUnreadMark'
import { RemoveUserFromGroupSchema } from '#layers/zalo/shared/schemas/actions/removeUserFromGroup'
import { ReuseAvatarSchema } from '#layers/zalo/shared/schemas/actions/reuseAvatar'
import { ReviewPendingMemberRequestSchema } from '#layers/zalo/shared/schemas/actions/reviewPendingMemberRequest'
import { SearchStickerSchema } from '#layers/zalo/shared/schemas/actions/searchSticker'
import { SendBankCardSchema } from '#layers/zalo/shared/schemas/actions/sendBankCard'
import { SendCardSchema } from '#layers/zalo/shared/schemas/actions/sendCard'
import { SendDeliveredEventSchema } from '#layers/zalo/shared/schemas/actions/sendDeliveredEvent'
import { SendFriendRequestSchema } from '#layers/zalo/shared/schemas/actions/sendFriendRequest'
import { SendLinkSchema } from '#layers/zalo/shared/schemas/actions/sendLink'
import { SendMessageSchema } from '#layers/zalo/shared/schemas/actions/sendMessage'
import { SendReportSchema } from '#layers/zalo/shared/schemas/actions/sendReport'
import { SendSeenEventSchema } from '#layers/zalo/shared/schemas/actions/sendSeenEvent'
import { SendStickerSchema } from '#layers/zalo/shared/schemas/actions/sendSticker'
import { SendTypingEventSchema } from '#layers/zalo/shared/schemas/actions/sendTypingEvent'
import { SendVideoSchema } from '#layers/zalo/shared/schemas/actions/sendVideo'
import { SendVoiceSchema } from '#layers/zalo/shared/schemas/actions/sendVoice'
import { SetHiddenConversationsSchema } from '#layers/zalo/shared/schemas/actions/setHiddenConversations'
import { SetMuteSchema } from '#layers/zalo/shared/schemas/actions/setMute'
import { SetPinnedConversationsSchema } from '#layers/zalo/shared/schemas/actions/setPinnedConversations'
import { SharePollSchema } from '#layers/zalo/shared/schemas/actions/sharePoll'
import { UnblockUserSchema } from '#layers/zalo/shared/schemas/actions/unblockUser'
import { UndoSchema } from '#layers/zalo/shared/schemas/actions/undo'
import { UndoFriendRequestSchema } from '#layers/zalo/shared/schemas/actions/undoFriendRequest'
import { UpdateActiveStatusSchema } from '#layers/zalo/shared/schemas/actions/updateActiveStatus'
import { UpdateArchivedChatListSchema } from '#layers/zalo/shared/schemas/actions/updateArchivedChatList'
import { UpdateAutoDeleteChatSchema } from '#layers/zalo/shared/schemas/actions/updateAutoDeleteChat'
import { UpdateAutoReplySchema } from '#layers/zalo/shared/schemas/actions/updateAutoReply'
import { UpdateCatalogSchema } from '#layers/zalo/shared/schemas/actions/updateCatalog'
import { UpdateGroupSettingsSchema } from '#layers/zalo/shared/schemas/actions/updateGroupSettings'
import { UpdateHiddenConversPinSchema } from '#layers/zalo/shared/schemas/actions/updateHiddenConversPin'
import { UpdateLabelsSchema } from '#layers/zalo/shared/schemas/actions/updateLabels'
import { UpdateLangSchema } from '#layers/zalo/shared/schemas/actions/updateLang'
import { UpdateProductCatalogSchema } from '#layers/zalo/shared/schemas/actions/updateProductCatalog'
import { UpdateProfileSchema } from '#layers/zalo/shared/schemas/actions/updateProfile'
import { UpdateProfileBioSchema } from '#layers/zalo/shared/schemas/actions/updateProfileBio'
import { UpdateQuickMessageSchema } from '#layers/zalo/shared/schemas/actions/updateQuickMessage'
import { UpdateSettingsSchema } from '#layers/zalo/shared/schemas/actions/updateSettings'
import { UpgradeGroupToCommunitySchema } from '#layers/zalo/shared/schemas/actions/upgradeGroupToCommunity'
import { UploadAttachmentSchema } from '#layers/zalo/shared/schemas/actions/uploadAttachment'
import { UploadProductPhotoSchema } from '#layers/zalo/shared/schemas/actions/uploadProductPhoto'
import { VotePollSchema } from '#layers/zalo/shared/schemas/actions/votePoll'

/**
 * One dispatchable `zca-js` method: how to validate a request for it, and how
 * to turn that request into the positional arguments the method expects.
 *
 * `method` stays camelCase — that is core's wire vocabulary (`api[method](...)`),
 * not this layer's naming. The registry key is the kebab-case URL segment.
 */
export interface ZaloActionDefinition {
  readonly method: string
  /** Absent for methods that take no arguments; those never read a body. */
  readonly schema?: ZodType
  readonly args: (body: unknown) => unknown[]
}

function defineAction<S extends ZodType>(
  method: string,
  schema: S,
  args: (body: z.output<S>) => unknown[],
): ZaloActionDefinition {
  // The route validates with this same `schema` immediately before calling
  // `args`, so the value is always the schema's output; the registry erases
  // that generic so 145 differently-typed actions can share one map.
  return { method, schema, args: body => args(body as z.output<S>) }
}

/** A `zca-js` method that takes no arguments, so there is nothing to validate. */
function arglessAction(method: string): ZaloActionDefinition {
  return { method, args: () => [] }
}

/**
 * Every `zca-js` method reachable through `/api/zalo/{sessionId}/actions/{action}`,
 * keyed by its URL segment. This map IS the allowlist: a name absent from it is
 * never dispatched, so no caller can reach a method this layer does not model.
 *
 * It replaces 145 near-identical route files. They were not merely repetitive:
 * each one became an entry in Nitro's generated route map, and at ~198 routes
 * TypeScript exceeded its instantiation depth resolving any typed $fetch call
 * in the app (TS2589), which broke typecheck in unrelated layers.
 */
export const ZALO_ACTIONS: Record<string, ZaloActionDefinition> = {
  'accept-friend-request': defineAction('acceptFriendRequest', AcceptFriendRequestSchema, body => [body.friendId]),
  'add-group-blocked-member': defineAction('addGroupBlockedMember', AddGroupBlockedMemberSchema, body => [body.memberId, body.groupId]),
  'add-group-deputy': defineAction('addGroupDeputy', AddGroupDeputySchema, body => [body.memberId, body.groupId]),
  'add-poll-options': defineAction('addPollOptions', AddPollOptionsSchema, body => [body.payload]),
  'add-quick-message': defineAction('addQuickMessage', AddQuickMessageSchema, body => [body.addPayload]),
  'add-reaction': defineAction('addReaction', AddReactionSchema, body => [body.icon, body.dest]),
  'add-unread-mark': defineAction('addUnreadMark', AddUnreadMarkSchema, body => [body.threadId, body.type]),
  'add-user-to-group': defineAction('addUserToGroup', AddUserToGroupSchema, body => [body.memberId, body.groupId]),
  'block-user': defineAction('blockUser', BlockUserSchema, body => [body.userId]),
  'block-view-feed': defineAction('blockViewFeed', BlockViewFeedSchema, body => [body.isBlockFeed, body.userId]),
  'change-account-avatar': defineAction('changeAccountAvatar', ChangeAccountAvatarSchema, body => [body.avatarSource]),
  'change-friend-alias': defineAction('changeFriendAlias', ChangeFriendAliasSchema, body => [body.alias, body.friendId]),
  'change-group-avatar': defineAction('changeGroupAvatar', ChangeGroupAvatarSchema, body => [body.avatarSource, body.groupId]),
  'change-group-name': defineAction('changeGroupName', ChangeGroupNameSchema, body => [body.name, body.groupId]),
  'change-group-owner': defineAction('changeGroupOwner', ChangeGroupOwnerSchema, body => [body.memberId, body.groupId]),
  'create-auto-reply': defineAction('createAutoReply', CreateAutoReplySchema, body => [body.payload]),
  'create-catalog': defineAction('createCatalog', CreateCatalogSchema, body => [body.catalogName]),
  'create-group': defineAction('createGroup', CreateGroupSchema, body => [body.options]),
  'create-note': defineAction('createNote', CreateNoteSchema, body => [body.options, body.groupId]),
  'create-poll': defineAction('createPoll', CreatePollSchema, body => [body.options, body.groupId]),
  'create-product-catalog': defineAction('createProductCatalog', CreateProductCatalogSchema, body => [body.payload]),
  'create-reminder': defineAction('createReminder', CreateReminderSchema, body => [body.options, body.threadId, body.type]),
  'delete-auto-reply': defineAction('deleteAutoReply', DeleteAutoReplySchema, body => [body.id]),
  'delete-avatar': defineAction('deleteAvatar', DeleteAvatarSchema, body => [body.photoId]),
  'delete-catalog': defineAction('deleteCatalog', DeleteCatalogSchema, body => [body.catalogId]),
  'delete-chat': defineAction('deleteChat', DeleteChatSchema, body => [body.lastMessage, body.threadId, body.type]),
  'delete-group-invite-box': defineAction('deleteGroupInviteBox', DeleteGroupInviteBoxSchema, body => [body.groupId, body.blockFutureInvite]),
  'delete-message': defineAction('deleteMessage', DeleteMessageSchema, body => [body.dest, body.onlyMe]),
  'delete-product-catalog': defineAction('deleteProductCatalog', DeleteProductCatalogSchema, body => [body.payload]),
  'disable-group-link': defineAction('disableGroupLink', DisableGroupLinkSchema, body => [body.groupId]),
  'disperse-group': defineAction('disperseGroup', DisperseGroupSchema, body => [body.groupId]),
  'edit-note': defineAction('editNote', EditNoteSchema, body => [body.options, body.groupId]),
  'edit-reminder': defineAction('editReminder', EditReminderSchema, body => [body.options, body.threadId, body.type]),
  'enable-group-link': defineAction('enableGroupLink', EnableGroupLinkSchema, body => [body.groupId]),
  'fetch-account-info': arglessAction('fetchAccountInfo'),
  'find-user': defineAction('findUser', FindUserSchema, body => [body.phoneNumber, body.avatarSize]),
  'find-user-by-username': defineAction('findUserByUsername', FindUserByUsernameSchema, body => [body.username, body.avatarSize]),
  'forward-message': defineAction('forwardMessage', ForwardMessageSchema, body => [body.payload, body.threadIds, body.type]),
  'get-alias-list': defineAction('getAliasList', GetAliasListSchema, body => [body.count, body.page]),
  'get-all-friends': defineAction('getAllFriends', GetAllFriendsSchema, body => [body.count, body.page, body.avatarSize]),
  'get-all-groups': arglessAction('getAllGroups'),
  'get-archived-chat-list': arglessAction('getArchivedChatList'),
  'get-auto-delete-chat': arglessAction('getAutoDeleteChat'),
  'get-auto-reply-list': arglessAction('getAutoReplyList'),
  'get-avatar-list': defineAction('getAvatarList', GetAvatarListSchema, body => [body.count, body.page]),
  'get-avatar-url-profile': defineAction('getAvatarUrlProfile', GetAvatarUrlProfileSchema, body => [body.friendIds, body.avatarSize]),
  'get-biz-account': defineAction('getBizAccount', GetBizAccountSchema, body => [body.friendId]),
  'get-catalog-list': defineAction('getCatalogList', GetCatalogListSchema, body => [body.payload]),
  'get-close-friends': arglessAction('getCloseFriends'),
  'get-context': arglessAction('getContext'),
  'get-cookie': arglessAction('getCookie'),
  'get-friend-board-list': defineAction('getFriendBoardList', GetFriendBoardListSchema, body => [body.conversationId]),
  'get-friend-onlines': arglessAction('getFriendOnlines'),
  'get-friend-recommendations': arglessAction('getFriendRecommendations'),
  'get-friend-request-status': defineAction('getFriendRequestStatus', GetFriendRequestStatusSchema, body => [body.friendId]),
  'get-full-avatar': defineAction('getFullAvatar', GetFullAvatarSchema, body => [body.friendId]),
  'get-group-blocked-member': defineAction('getGroupBlockedMember', GetGroupBlockedMemberSchema, body => [body.payload, body.groupId]),
  'get-group-chat-history': defineAction('getGroupChatHistory', GetGroupChatHistorySchema, body => [body.groupId, body.count]),
  'get-group-info': defineAction('getGroupInfo', GetGroupInfoSchema, body => [body.groupId]),
  'get-group-invite-box-info': defineAction('getGroupInviteBoxInfo', GetGroupInviteBoxInfoSchema, body => [body.payload]),
  'get-group-invite-box-list': defineAction('getGroupInviteBoxList', GetGroupInviteBoxListSchema, body => [body.payload]),
  'get-group-link-detail': defineAction('getGroupLinkDetail', GetGroupLinkDetailSchema, body => [body.groupId]),
  'get-group-link-info': defineAction('getGroupLinkInfo', GetGroupLinkInfoSchema, body => [body.payload]),
  'get-group-members-info': defineAction('getGroupMembersInfo', GetGroupMembersInfoSchema, body => [body.memberId]),
  'get-hidden-conversations': arglessAction('getHiddenConversations'),
  'get-labels': arglessAction('getLabels'),
  'get-list-board': defineAction('getListBoard', GetListBoardSchema, body => [body.options, body.groupId]),
  'get-list-reminder': defineAction('getListReminder', GetListReminderSchema, body => [body.options, body.threadId, body.type]),
  'get-multi-users-by-phones': defineAction('getMultiUsersByPhones', GetMultiUsersByPhonesSchema, body => [body.phoneNumbers, body.avatarSize]),
  'get-mute': arglessAction('getMute'),
  'get-own-id': arglessAction('getOwnId'),
  'get-pending-group-members': defineAction('getPendingGroupMembers', GetPendingGroupMembersSchema, body => [body.groupId]),
  'get-pin-conversations': arglessAction('getPinConversations'),
  'get-poll-detail': defineAction('getPollDetail', GetPollDetailSchema, body => [body.pollId]),
  'get-product-catalog-list': defineAction('getProductCatalogList', GetProductCatalogListSchema, body => [body.payload]),
  'get-qr': defineAction('getQR', GetQRSchema, body => [body.userId]),
  'get-quick-message-list': arglessAction('getQuickMessageList'),
  'get-related-friend-group': defineAction('getRelatedFriendGroup', GetRelatedFriendGroupSchema, body => [body.friendId]),
  'get-reminder': defineAction('getReminder', GetReminderSchema, body => [body.reminderId]),
  'get-reminder-responses': defineAction('getReminderResponses', GetReminderResponsesSchema, body => [body.reminderId]),
  'get-sent-friend-request': arglessAction('getSentFriendRequest'),
  'get-settings': arglessAction('getSettings'),
  'get-sticker-category-detail': defineAction('getStickerCategoryDetail', GetStickerCategoryDetailSchema, body => [body.cateId]),
  'get-stickers': defineAction('getStickers', GetStickersSchema, body => [body.keyword]),
  'get-stickers-detail': defineAction('getStickersDetail', GetStickersDetailSchema, body => [body.stickerIds]),
  'get-unread-mark': arglessAction('getUnreadMark'),
  'get-user-info': defineAction('getUserInfo', GetUserInfoSchema, body => [body.userId, body.avatarSize]),
  'invite-user-to-groups': defineAction('inviteUserToGroups', InviteUserToGroupsSchema, body => [body.userId, body.groupId]),
  'join-group-invite-box': defineAction('joinGroupInviteBox', JoinGroupInviteBoxSchema, body => [body.groupId]),
  'join-group-link': defineAction('joinGroupLink', JoinGroupLinkSchema, body => [body.link]),
  'keep-alive': arglessAction('keepAlive'),
  'last-online': defineAction('lastOnline', LastOnlineSchema, body => [body.uid]),
  'leave-group': defineAction('leaveGroup', LeaveGroupSchema, body => [body.groupId, body.silent]),
  'lock-poll': defineAction('lockPoll', LockPollSchema, body => [body.pollId]),
  'parse-link': defineAction('parseLink', ParseLinkSchema, body => [body.link]),
  'reject-friend-request': defineAction('rejectFriendRequest', RejectFriendRequestSchema, body => [body.friendId]),
  'remove-friend': defineAction('removeFriend', RemoveFriendSchema, body => [body.friendId]),
  'remove-friend-alias': defineAction('removeFriendAlias', RemoveFriendAliasSchema, body => [body.friendId]),
  'remove-group-blocked-member': defineAction('removeGroupBlockedMember', RemoveGroupBlockedMemberSchema, body => [body.memberId, body.groupId]),
  'remove-group-deputy': defineAction('removeGroupDeputy', RemoveGroupDeputySchema, body => [body.memberId, body.groupId]),
  'remove-quick-message': defineAction('removeQuickMessage', RemoveQuickMessageSchema, body => [body.itemIds]),
  'remove-reminder': defineAction('removeReminder', RemoveReminderSchema, body => [body.reminderId, body.threadId, body.type]),
  'remove-unread-mark': defineAction('removeUnreadMark', RemoveUnreadMarkSchema, body => [body.threadId, body.type]),
  'remove-user-from-group': defineAction('removeUserFromGroup', RemoveUserFromGroupSchema, body => [body.memberId, body.groupId]),
  'reset-hidden-convers-pin': arglessAction('resetHiddenConversPin'),
  'reuse-avatar': defineAction('reuseAvatar', ReuseAvatarSchema, body => [body.photoId]),
  'review-pending-member-request': defineAction('reviewPendingMemberRequest', ReviewPendingMemberRequestSchema, body => [body.payload, body.groupId]),
  'search-sticker': defineAction('searchSticker', SearchStickerSchema, body => [body.keyword, body.limit]),
  'send-bank-card': defineAction('sendBankCard', SendBankCardSchema, body => [body.payload, body.threadId, body.type]),
  'send-card': defineAction('sendCard', SendCardSchema, body => [body.options, body.threadId, body.type]),
  'send-delivered-event': defineAction('sendDeliveredEvent', SendDeliveredEventSchema, body => [body.isSeen, body.messages, body.type]),
  'send-friend-request': defineAction('sendFriendRequest', SendFriendRequestSchema, body => [body.msg, body.userId]),
  'send-link': defineAction('sendLink', SendLinkSchema, body => [body.options, body.threadId, body.type]),
  'send-message': defineAction('sendMessage', SendMessageSchema, body => [body.message, body.threadId, body.type]),
  'send-report': defineAction('sendReport', SendReportSchema, body => [body.options, body.threadId, body.type]),
  'send-seen-event': defineAction('sendSeenEvent', SendSeenEventSchema, body => [body.messages, body.type]),
  'send-sticker': defineAction('sendSticker', SendStickerSchema, body => [body.sticker, body.threadId, body.type]),
  'send-typing-event': defineAction('sendTypingEvent', SendTypingEventSchema, body => [body.threadId, body.type, body.destType]),
  'send-video': defineAction('sendVideo', SendVideoSchema, body => [body.options, body.threadId, body.type]),
  'send-voice': defineAction('sendVoice', SendVoiceSchema, body => [body.options, body.threadId, body.type]),
  'set-hidden-conversations': defineAction('setHiddenConversations', SetHiddenConversationsSchema, body => [body.hidden, body.threadId, body.type]),
  'set-mute': defineAction('setMute', SetMuteSchema, body => [body.params, body.threadID, body.type]),
  'set-pinned-conversations': defineAction('setPinnedConversations', SetPinnedConversationsSchema, body => [body.pinned, body.threadId, body.type]),
  'share-poll': defineAction('sharePoll', SharePollSchema, body => [body.pollId]),
  'unblock-user': defineAction('unblockUser', UnblockUserSchema, body => [body.userId]),
  'undo': defineAction('undo', UndoSchema, body => [body.payload, body.threadId, body.type]),
  'undo-friend-request': defineAction('undoFriendRequest', UndoFriendRequestSchema, body => [body.friendId]),
  'update-active-status': defineAction('updateActiveStatus', UpdateActiveStatusSchema, body => [body.active]),
  'update-archived-chat-list': defineAction('updateArchivedChatList', UpdateArchivedChatListSchema, body => [body.isArchived, body.conversations]),
  'update-auto-delete-chat': defineAction('updateAutoDeleteChat', UpdateAutoDeleteChatSchema, body => [body.ttl, body.threadId, body.type]),
  'update-auto-reply': defineAction('updateAutoReply', UpdateAutoReplySchema, body => [body.payload]),
  'update-catalog': defineAction('updateCatalog', UpdateCatalogSchema, body => [body.payload]),
  'update-group-settings': defineAction('updateGroupSettings', UpdateGroupSettingsSchema, body => [body.options, body.groupId]),
  'update-hidden-convers-pin': defineAction('updateHiddenConversPin', UpdateHiddenConversPinSchema, body => [body.pin]),
  'update-labels': defineAction('updateLabels', UpdateLabelsSchema, body => [body.payload]),
  'update-lang': defineAction('updateLang', UpdateLangSchema, body => [body.language]),
  'update-product-catalog': defineAction('updateProductCatalog', UpdateProductCatalogSchema, body => [body.payload]),
  'update-profile': defineAction('updateProfile', UpdateProfileSchema, body => [body.payload]),
  'update-profile-bio': defineAction('updateProfileBio', UpdateProfileBioSchema, body => [body.status]),
  'update-quick-message': defineAction('updateQuickMessage', UpdateQuickMessageSchema, body => [body.updatePayload, body.itemId]),
  'update-settings': defineAction('updateSettings', UpdateSettingsSchema, body => [body.type, body.value]),
  'upgrade-group-to-community': defineAction('upgradeGroupToCommunity', UpgradeGroupToCommunitySchema, body => [body.groupId]),
  'upload-attachment': defineAction('uploadAttachment', UploadAttachmentSchema, body => [body.sources, body.threadId, body.type]),
  'upload-product-photo': defineAction('uploadProductPhoto', UploadProductPhotoSchema, body => [body.payload]),
  'vote-poll': defineAction('votePoll', VotePollSchema, body => [body.pollId, body.optionId]),
}
