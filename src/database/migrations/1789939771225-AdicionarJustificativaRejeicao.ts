import { MigrationInterface, QueryRunner } from "typeorm";

export class AdicionarJustificativaRejeicao1789939771225 implements MigrationInterface {
    name = 'AdicionarJustificativaRejeicao1789939771225'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "solicitacoes" ADD "justificativa_rejeicao" character varying(200)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "solicitacoes" DROP COLUMN "justificativa_rejeicao"`);
    }

}
