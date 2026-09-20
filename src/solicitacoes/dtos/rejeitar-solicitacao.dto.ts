import { IsInt, Min, IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

export class RejeitarSolicitacaoDto {
  @IsInt()
  @Min(1)
  versao!: number;

  @IsString()
  @MinLength(10)
  @MaxLength(200)
  @IsNotEmpty()
  justificativa!: string;
}