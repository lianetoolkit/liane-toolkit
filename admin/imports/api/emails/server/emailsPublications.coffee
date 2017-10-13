{Emails} = require '../emails.coffee'

Meteor.publish 'admin.emails', ({search, limit, orderBy, fields}) ->
  @unblock()

  if Meteor.settings.public.deployMode is "local"
    Meteor._sleepForMs 500

  currentUser = @userId
  if currentUser and Roles.userIsInRole(currentUser, ['admin','staff'])
    options =
      sort: {}
      limit: Math.min(limit, 1000)
      fields: fields
    options['sort'][orderBy.field] = orderBy.ordering
    Emails.find(search, options)

  else
    @stop()
    return


Meteor.publish 'admin.emails.counter', ({ search }) ->
  @unblock()
  currentUser = @userId
  if currentUser and Roles.userIsInRole(currentUser, ['admin','staff'])
    Counts.publish(
      this,
      'admin.emails.counter',
      Emails.find(search)
    )
    return
