import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository, DataSource } from 'typeorm';
import { CriarSolicitacaoDto } from './dtos/criar-solicitacao.dto';
import { FiltrarSolicitacoesDto } from './dtos/filtrar-solicitacao.dto';
import { Solicitacao } from './solicitacoes.entity';
import { Auditoria } from 'src/auditoria/auditoria.entity';

@Injectable()
export class SolicitacoesService {
  constructor(
    @InjectRepository(Solicitacao)
    private readonly repository: Repository<Solicitacao>,
    private readonly dataSource: DataSource,
  ) { }

  listar(filtros: FiltrarSolicitacoesDto) {
    const where: FindOptionsWhere<Solicitacao> = {};

    if (filtros.status) {
      where.status = filtros.status;
    }

    if (filtros.centroCusto) {
      where.centroCusto = filtros.centroCusto;
    }

    if (filtros.prioridade) {
      where.prioridade = filtros.prioridade;
    }

    return this.repository.find({
      where,
      order: { id: 'ASC' },
    });
  }

  async buscarPorId(id: number) {
    const solicitacao = await this.repository.findOneBy({ id });
    if (!solicitacao) {
      throw new NotFoundException('Solicitação não encontrada');
    }
    return solicitacao;
  }

  criar(dto: CriarSolicitacaoDto) {
    const solicitacao = this.repository.create({
      titulo: dto.titulo,
      centroCusto: dto.centroCusto,
      prioridade: dto.prioridade,
      status: 'pendente',
    });

    return this.repository.save(solicitacao);
  }

  async aprovar(id: number, versaoEsperada: number, atorId: number) {
    return this.dataSource.transaction(async (manager) => {
      const solicitacao = await manager.findOneBy(Solicitacao, { id });

      if (!solicitacao) {
        throw new NotFoundException('Solicitação não encontrada');
      }
      if (solicitacao.status !== 'pendente') {
        throw new ConflictException('Solicitação não está pendente');
      }

      const resultado = await manager
        .createQueryBuilder()
        .update(Solicitacao)
        .set({ status: 'aprovada', versao: () => 'versao + 1' })
        .where('id = :id', { id })
        .andWhere('versao = :versao', { versao: versaoEsperada })
        .andWhere('status = :status', { status: 'pendente' })
        .execute();

      if (resultado.affected !== 1) {
        throw new ConflictException(
          'A solicitação foi alterada; consulte novamente',
        );
      }

      await manager.insert(Auditoria, {
        atorId,
        acao: 'SOLICITACAO_APROVADA',
        recursoTipo: 'solicitacao',
        recursoId: id,
        detalhes: {
          statusAnterior: 'pendente',
          statusAtual: 'aprovada',
          versaoAnterior: versaoEsperada,
        },
      });

      return manager.findOneByOrFail(Solicitacao, { id });
    });
  }
}