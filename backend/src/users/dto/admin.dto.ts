import { PartialType } from '@nestjs/swagger';
import {
  BaseFilterDto,
  BasePersonalInfoDto,
  BaseUpdateStatusDto,
  BaseResetPasswordDto,
  BaseDeleteDto,
} from './user.dto';

export class FilterAdminDto extends BaseFilterDto {
  // Nếu cần thêm trường mới, có thể thêm ở đây
}
export class CreateAdminDto extends BasePersonalInfoDto {
  // Nếu cần thêm trường mới, có thể thêm ở đây
}
export class UpdateAdminDto extends PartialType(CreateAdminDto) {
  // Nếu cần thêm trường mới, có thể thêm ở đây
}
export class UpdateStatusAdminDto extends BaseUpdateStatusDto {
  // Nếu cần thêm trường mới, có thể thêm ở đây
}
export class ResetPasswordAdminDto extends BaseResetPasswordDto {
  // Nếu cần thêm trường mới, có thể thêm ở đây
}
export class DeleteAdminDto extends BaseDeleteDto {
  // Nếu cần thêm trường mới, có thể thêm ở đây
}
