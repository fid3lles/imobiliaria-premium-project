package com.github.fid3lles.imobiliaria_core.domain.propriedade;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class PropriedadeService {

    private final PropriedadeRepository propriedadeRepository;

    public PropriedadeService(PropriedadeRepository propriedadeRepository) {
        this.propriedadeRepository = propriedadeRepository;
    }

    // defaults pra não quebrar caso você esqueça de setar as envs/properties
    @Value("${app.media.base-dir:/data/propriedades}")
    private String mediaBaseDir;

    @Value("${app.media.base-url:/propriedades}")
    private String mediaBaseUrl;

    private static final Set<String> EXT_OK = Set.of("jpg", "jpeg", "png", "webp");

    public Page<Propriedade> buscar(BuscaPropriedadeFiltro filtro, Pageable pageable) {
        Page<Propriedade> page = propriedadeRepository.findAll(
                PropriedadeSpecification.comFiltro(filtro),
                pageable
        );

        return page.map(this::embarcarMidias);
    }

    public Propriedade buscarPorID(Long id) {
        Optional<Propriedade> propriedadeOpt = propriedadeRepository.findById(id);
        return propriedadeOpt.map(this::embarcarMidias).orElse(null);
    }

    public List<String> getCidades() {
        return propriedadeRepository.findCidadesDistinctOrdenado();
    }

    public List<String> getBairrosPorCidade(String cidade) {
        return propriedadeRepository.findBairrosPorCidade(cidade);
    }

    public List<String> getImovelTipos() {
        return propriedadeRepository.findTipoDistinctOrdenado().stream().distinct().toList();
    }

    public List<String> getCaracteristicasInternasTipos() {
        return extrairParaUmaListaDistinta(propriedadeRepository.findCaracteristicasInternas());
    }

    public List<String> getCaracteristicasExternasTipos() {
        return extrairParaUmaListaDistinta(propriedadeRepository.findCaracteristicasExternas());
    }

    private Propriedade embarcarMidias(Propriedade p) {
        List<String> links = listarLinksImagens(p.getId());
        p.setMidias(links); // garanta que existe esse setter/método na entidade
        return p;
    }

    private List<String> listarLinksImagens(Long propriedadeId) {
        Path dir = Path.of(mediaBaseDir, String.valueOf(propriedadeId));

        if (!Files.exists(dir) || !Files.isDirectory(dir)) {
            return List.of();
        }

        try (var stream = Files.list(dir)) {
            return stream
                    .filter(Files::isRegularFile)
                    .map(Path::getFileName)
                    .map(Path::toString)
                    .filter(this::isImagem)
                    .sorted()
                    .map(nomeArquivo -> {
                        // IMPORTANTÍSSIMO: encode do nome do arquivo (espaços/acentos/etc)
                        String encoded = UriUtils.encodePathSegment(nomeArquivo, StandardCharsets.UTF_8);
                        return mediaBaseUrl + "/" + propriedadeId + "/" + encoded;
                    })
                    .toList();
        } catch (IOException e) {
            return List.of();
        }
    }

    private boolean isImagem(String filename) {
        int idx = filename.lastIndexOf('.');
        if (idx < 0) return false;
        String ext = filename.substring(idx + 1).toLowerCase();
        return EXT_OK.contains(ext);
    }

    private static List<String> extrairParaUmaListaDistinta(List<List<String>> lista) {
        return lista.stream()
                .flatMap(List::stream)
                .distinct()
                .toList();
    }
}