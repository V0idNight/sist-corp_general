import { Controller, Get, Param, ParseIntPipe, UseGuards, Patch, Post, Body, Query, Req } from '@nestjs/common';
import { SolicitacoesService } from './solicitacoes.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CriarSolicitacaoDto } from './dtos/criar-solicitacao.dto';
import { FiltrarSolicitacoesDto } from './dtos/filtrar-solicitacao.dto';
import { AprovarSolicitacaoDto } from './dtos/aprovar-solicitacao.dto';
import { RejeitarSolicitacaoDto } from './dtos/rejeitar-solicitacao.dto';

type RequisicaoAutenticada = {
    user: { id: number; papel: string };
};

@Controller('solicitacoes')
export class SolicitacoesController {
    constructor(private readonly solicitacoesService: SolicitacoesService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    listar(@Query() filtros: FiltrarSolicitacoesDto) {
        return this.solicitacoesService.listar(filtros);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    criar(@Body() dto: CriarSolicitacaoDto) {
        return this.solicitacoesService.criar(dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    buscarPorId(@Param('id', ParseIntPipe) id: number) {
        return this.solicitacoesService.buscarPorId(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('gestor')
    @Patch(':id/aprovar')
    aprovar(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AprovarSolicitacaoDto,
        @Req() request: RequisicaoAutenticada,
    ) {
        return this.solicitacoesService.aprovar(id, dto.versao, request.user.id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('gestor')
    @Patch(':id/rejeitar')
    rejeitar(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: RejeitarSolicitacaoDto,
        @Req() request: RequisicaoAutenticada,
    ) {
        return this.solicitacoesService.rejeitar(id, dto.versao, request.user.id, dto.justificativa);
    }
}