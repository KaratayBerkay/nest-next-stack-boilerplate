import { ProfileAvatarField } from "./ProfileAvatarField";
import { ProfileBasicFields } from "./ProfileBasicFields";
import { ProfilePreferencesFields } from "./ProfilePreferencesFields";
import type { ProfileFieldsProps } from "./ProfileFields-types";

export function ProfileFields(props: ProfileFieldsProps) {
  return (
    <>
      <ProfileAvatarField form={props.form} />
      <ProfileBasicFields {...props} />
      <ProfilePreferencesFields form={props.form} t={props.t} />
    </>
  );
}
