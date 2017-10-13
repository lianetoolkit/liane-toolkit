import React from "react";

export default function UsersLink({ email, userId }) {
  return (
    <div>
      {email}
      <div>
        <a
          href={FlowRouter.path("Admin.userDetail", {
            userId
          })}
        >
          {userId}
        </a>
      </div>
    </div>
  );
}
