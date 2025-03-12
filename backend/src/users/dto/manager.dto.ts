import { PartialType } from '@nestjs/swagger';
import {
  BaseFilterDto,
  BasePersonalInfoDto,
  BaseUpdateStatusDto,
  BaseResetPasswordDto,
  BaseDeleteDto,
} from './user.dto';

export class FilterManagerDto extends BaseFilterDto {
  // Nếu cần thêm trường mới, có thể thêm ở đây
}
export class CreateManagerDto extends BasePersonalInfoDto {
  // Nếu cần thêm trường mới, có thể thêm ở đây
}
export class UpdateManagerDto extends PartialType(CreateManagerDto) {
  // Nếu cần thêm trường mới, có thể thêm ở đây
}
export class UpdateStatusManagerDto extends BaseUpdateStatusDto {
  // Nếu cần thêm trường mới, có thể thêm ở đây
}
export class ResetPasswordManagerDto extends BaseResetPasswordDto {
  // Nếu cần thêm trường mới, có thể thêm ở đây
}
export class DeleteManagerDto extends BaseDeleteDto {
  // Nếu cần thêm trường mới, có thể thêm ở đây
}
